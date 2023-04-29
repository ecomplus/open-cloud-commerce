import type { PageContext } from '@@sf/ssr-context';
import type { LayoutContent } from '@@sf/content';
import type { Props as UseShopHeaderProps } from '@@sf/composables/use-shop-header';
import { parseLayoutContent } from '@@sf/composables/use-pitch-bar';

type ShopHeaderProps = Omit<UseShopHeaderProps, 'header'> & {
  serviceLinks?: LayoutContent['service_links'],
};

export interface Props {
  pageContext: PageContext;
}

const usePageLayout = async ({ pageContext }: Props) => {
  const { apiState, cms } = pageContext;
  const cmsLayout = await cms('layout');
  const {
    header: cmsHeader,
    service_links: cmsServiceLinks,
  } = cmsLayout;
  const pitchBar = parseLayoutContent(cmsLayout);
  const shopHeader: ShopHeaderProps = {
    categories: apiState.categories || [],
    menuCategorySlugs: cmsHeader.inline_menu_categories?.featured,
    menuRandomCategories: cmsHeader.inline_menu_categories?.random,
    isAlphabeticalSortSubmenu: cmsHeader.alphabetical_sort_submenu,
    serviceLinks: cmsServiceLinks,
  };
  return {
    pitchBar,
    shopHeader,
  };
};

export default usePageLayout;

export { usePageLayout };

export type { ShopHeaderProps };
