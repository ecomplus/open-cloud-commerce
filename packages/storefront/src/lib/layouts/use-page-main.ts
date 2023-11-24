import type { ResourceId } from '@cloudcommerce/types';
import type { PageContent } from '@@sf/content';
import type { RouteContext } from '@@sf/ssr-context';
import type { Props as UseBannerProps } from '@@sf/composables/use-banner';
import type { Props as UseProductShelfProps } from '@@sf/composables/use-product-shelf';
import { useProductShelf } from '@@sf/composables/use-product-shelf';

export interface Props {
  routeContext: RouteContext;
  handleCustomSection?: (type: `${string}:${string}`, content: Record<string, any>) =>
    Promise<{ props: Record<string, any> }>;
}

type PageContentHero = Exclude<PageContent['hero'], undefined>;
const now = Date.now();
const parseBanners = (banners: PageContentHero['slides']) => {
  const validBanners: UseBannerProps[] = [];
  banners.forEach(({
    startsAt,
    endsAt,
    ...bannerProps
  }) => {
    if (startsAt && new Date(startsAt).getTime() < now) return;
    if (endsAt && new Date(endsAt).getTime() > now) return;
    validBanners.push(bannerProps);
  });
  return validBanners;
};

export const usePageHero = async ({ routeContext }: Props) => {
  const { cmsContent } = routeContext;
  const heroSlider: Omit<PageContentHero, 'slides'>
    & { slides: UseBannerProps[] } = { slides: [] };
  const heroContent = cmsContent?.hero;
  if (heroContent) {
    heroSlider.autoplay = heroContent.autoplay;
    if (heroContent.slides) {
      heroSlider.slides = parseBanners(heroContent.slides);
    }
  }
  return { heroSlider };
};

type CustomSection = { type: `${string}:${string}`, props: any };
type ProductDetailsProps = { hasDescription?: boolean, hasSpecifications?: boolean };

export const usePageSections = async <T extends CustomSection = CustomSection>
({ routeContext, handleCustomSection }: Props) => {
  const sectionsContent = routeContext.cmsContent?.sections;
  const sections: Array<
    T
    | { type: 'product-shelf', props: UseProductShelfProps }
    | { type: 'banners-grid', props: { banners: UseBannerProps[] } }
    | { type: 'product-details', props: ProductDetailsProps }
    | { type: 'breadcrumbs', props: {} }
    | { type: 'related-products', props: {} }
    | { type: 'doc-description', props: {} }
    | { type: 'product-specifications', props: {} }
  > = [];
  if (sectionsContent) {
    await Promise.all(sectionsContent.map(async ({ type, ...sectionContent }, index) => {
      if (type === 'product-shelf') {
        const {
          collectionIdAndInfo,
          isHeadless,
          isShuffle,
          ...rest
        } = sectionContent;
        let { sort, title } = sectionContent;
        switch (sort) {
          case 'offers':
            sort = '-price_discount';
            break;
          case 'news':
            sort = '-_id';
            break;
          case 'lowest_price':
            sort = 'price';
            break;
          case 'highest_price':
            sort = '-price';
            break;
          default:
        }
        let collectionId: ResourceId | null = null;
        let searchQuery: `&${string}` | undefined;
        let titleLink: string | undefined;
        if (collectionIdAndInfo) {
          const [_id, resource, name, path] = (collectionIdAndInfo as string)
            .split(':') as [
              ResourceId,
              string | undefined,
              string | undefined,
              string | undefined,
            ];
          collectionId = _id;
          if (resource === 'categories') {
            searchQuery = `&categories._id=${_id}`;
          } else if (resource === 'brands') {
            searchQuery = `&brands._id=${_id}`;
          }
          if (!title && title !== null && name) {
            title = name;
          }
          titleLink = path;
        }
        const props = {
          ...rest,
          collectionId,
          searchQuery,
          sort,
          title: isHeadless ? null : title,
          titleLink,
          isShuffle,
        };
        const { fetching, products } = useProductShelf(props);
        await fetching;
        sections[index] = {
          type,
          props: { ...props, products },
        };
        return;
      }

      if (type === 'banners-grid') {
        sections[index] = {
          type,
          props: {
            banners: parseBanners(sectionContent.banners || []),
          },
        };
        return;
      }
      switch (type) {
        case 'breadcrumbs':
        case 'product-details':
        case 'related-products':
        case 'doc-description':
        case 'product-specifications':
          // Bypassed sections
          sections[index] = {
            type,
            props: sectionContent,
          };
          return;
        default:
      }
      if (typeof handleCustomSection === 'function') {
        const { props } = await handleCustomSection(
          type as `${string}:${string}`,
          sectionContent,
        );
        sections[index] = { type, props } as T;
      }
    }));
  }
  /*
  if (import.meta.env.DEV) {
    console.log('> Sections loaded');
  }
  */
  return {
    sections,
  };
};
