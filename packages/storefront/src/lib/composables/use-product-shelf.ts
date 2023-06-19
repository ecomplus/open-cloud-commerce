import type { ResourceId, Collections, SearchItems } from '@cloudcommerce/types';
import { ref, computed } from 'vue';
import api from '@cloudcommerce/api';
import { inStock as checkInStock } from '@ecomplus/utils';

export interface Props {
  collectionId: ResourceId | null;
  searchQuery?: `&${string}` | '';
  sort?: '-sales' | '-created_at' | 'price' | '-price' | '-price_discount' | string;
  title?: string | null;
  titleLink?: string | null;
  isShuffle?: boolean;
  limit?: number;
  page?: number;
  products?: SearchItems;
}

const useProductShelf = (props: Props) => {
  const title = ref<string | null>(props.title || '');
  const titleLink = ref<string | null>(props.titleLink || '');
  const isFetching = ref(false);
  const fetching = ref<Promise<any> | null>(null);
  const fetchError = ref<Error | null>(null);
  const _products = ref<SearchItems>([]);
  const products = computed(() => {
    if (props.products) return props.products;
    return _products.value;
  });

  if (!props.products) {
    isFetching.value = true;
    fetching.value = (async () => {
      let searchQuery = props.searchQuery || '';
      let collection: Collections | undefined;
      if (props.collectionId) {
        try {
          const { data } = await api.get(`collections/${props.collectionId}`);
          collection = data;
        } catch (err: any) {
          console.error(err);
          fetchError.value = err;
        }
        const productIds = collection?.products;
        if (Array.isArray(productIds) && productIds.length) {
          searchQuery += `&_id=${productIds.slice(0, 60).join(',')}`;
        }
        if (!title.value && title.value !== null && collection?.name) {
          title.value = collection?.name;
        }
      }
      const limit = props.limit || 24;
      const offset = props.page ? (props.page - 1) * limit : 0;
      let endpointQuery = `offset=${offset}&limit=${limit}`;
      if (props.sort) {
        endpointQuery += `&sort=${props.sort}`;
      }
      endpointQuery += searchQuery;
      try {
        const { data } = await api.get(`search/v1?${endpointQuery}`);
        if (props.isShuffle) {
          let m = data.result.filter((item) => {
            return item.available && checkInStock(item);
          }).length;
          let t: typeof data.result[0];
          let i: number;
          while (m) {
            // eslint-disable-next-line no-plusplus
            i = Math.floor(Math.random() * m--);
            t = data.result[m];
            data.result[m] = data.result[i];
            data.result[i] = t;
          }
        }
        _products.value = data.result;
      } catch (err: any) {
        console.error(err);
        fetchError.value = err;
      }
      isFetching.value = false;
    })();
  }

  return {
    title,
    titleLink,
    isFetching,
    fetching,
    fetchError,
    products,
  };
};

export default useProductShelf;

export { useProductShelf };
