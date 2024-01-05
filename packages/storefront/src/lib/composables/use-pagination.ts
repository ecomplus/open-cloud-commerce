/* REFERENCE: https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript */
import {
  ref,
  computed,
  watch,
  toRef,
} from 'vue';

export interface Props {
  totalItems?: number,
  totalPages?: number,
  page?: number,
  pageSize?: number,
  maxPages?: number,
  isUrlPath?: boolean,
}

const usePagination = (props: Props) => {
  const totalPages = computed(() => {
    if (props.totalPages) return props.totalPages;
    if (props.totalItems && props.pageSize) {
      return Math.ceil(props.totalItems / props.pageSize);
    }
    return 1;
  });
  const pageNumber = computed(() => {
    const currentPage = props.page || 1;
    if (currentPage < 1) return 1;
    if (currentPage > totalPages.value) return totalPages.value;
    return currentPage;
  });
  const maxPages = computed(() => props.maxPages || 10);
  const startPage = computed(() => {
    if (totalPages.value <= maxPages.value) return 1;
    const maxPagesBeforeCurrent = Math.floor(maxPages.value / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPages.value / 2) - 1;
    if (pageNumber.value <= maxPagesBeforeCurrent) return 1;
    if (pageNumber.value + maxPagesAfterCurrent >= totalPages.value) {
      return totalPages.value - maxPages.value + 1;
    }
    return pageNumber.value - maxPagesBeforeCurrent;
  });
  const endPage = computed(() => {
    if (totalPages.value <= maxPages.value) return totalPages.value;
    const maxPagesBeforeCurrent = Math.floor(maxPages.value / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPages.value / 2) - 1;
    if (pageNumber.value <= maxPagesBeforeCurrent) return maxPages.value;
    if (pageNumber.value + maxPagesAfterCurrent >= totalPages.value) {
      return totalPages.value;
    }
    return pageNumber.value + maxPagesAfterCurrent;
  });
  const pages = computed(() => {
    return Array.from(Array((endPage.value + 1) - startPage.value).keys())
      .map((i) => startPage.value + i);
  });

  const baseUrl = ref('');
  watch(toRef(props.isUrlPath), () => {
    const url = import.meta.env.SSR
      ? global.astroUrl
      : new URL(window.location.toString());
    if (props.isUrlPath && !url.pathname.endsWith('/')) {
      url.pathname += '/';
    } else {
      url.searchParams.delete('p');
    }
    baseUrl.value = url.toString();
  }, {
    immediate: true,
  });
  const getPageLink = (pageN: number) => {
    if (props.isUrlPath) return `../${pageN}`;
    return `?p=${pageN}`;
  };
  const pageLinks = computed(() => {
    return pages.value.map((pageN) => baseUrl.value + getPageLink(pageN));
  });
  const prevPageLink = computed(() => {
    if (pageNumber.value <= 1) return null;
    return baseUrl.value + getPageLink(pageNumber.value - 1);
  });
  const nextPageLink = computed(() => {
    if (pageNumber.value >= totalPages.value) return null;
    return baseUrl.value + getPageLink(pageNumber.value + 1);
  });

  return {
    totalPages,
    startPage,
    endPage,
    pages,
    pageLinks,
    prevPageLink,
    nextPageLink,
  };
};

export default usePagination;

export { usePagination };
