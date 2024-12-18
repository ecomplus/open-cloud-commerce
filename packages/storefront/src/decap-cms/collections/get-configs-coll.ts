export type CmsCollOptions = {
  domain?: string;
  baseDir: string;
  locale: string;
  maxFileSize: number;
  markdownOptions: Record<string, any>;
};

const getConfigsColl = ({
  baseDir,
  maxFileSize,
  markdownOptions,
}: CmsCollOptions) => ({
  name: 'config',
  label: {
    en: 'Settings & layout',
    pt: 'Configurações e layout',
  },
  description: {
    en: 'General settings for site identity and metadata',
    pt: 'Configurações gerais para identidade e metadados do site',
  },
  delete: false,
  editor: {
    preview: false,
  },
  files: [
    {
      name: 'settings',
      label: {
        en: 'General config',
        pt: 'Configurações gerais',
      },
      file: `${baseDir}content/settings.json`,
      editor: {
        preview: true,
      },
      fields: [
        {
          label: 'e-com.plus Store ID',
          name: 'storeId',
          widget: 'hidden',
        },
        {
          label: 'Repository',
          name: 'repository',
          widget: 'hidden',
        },
        {
          label: {
            en: 'Domain name',
            pt: 'Domínio',
          },
          name: 'domain',
          widget: 'string',
        },
        {
          label: {
            en: 'Store name',
            pt: 'Nome da loja',
          },
          name: 'name',
          widget: 'string',
        },
        {
          label: {
            en: 'Short description',
            pt: 'Descrição curta',
          },
          name: 'description',
          widget: 'text',
        },
        {
          label: {
            en: 'Logo',
            pt: 'Logomarca',
          },
          name: 'logo',
          widget: 'image',
          media_library: {
            config: {
              max_file_size: maxFileSize,
            },
          },
        },
        {
          label: {
            en: 'Icon',
            pt: 'Ícone',
          },
          name: 'icon',
          widget: 'image',
          media_library: {
            config: {
              max_file_size: maxFileSize,
            },
          },
        },
        {
          label: {
            en: 'Primary color',
            pt: 'Cor primária',
          },
          name: 'primaryColor',
          widget: 'color',
        },
        {
          label: {
            en: 'Secondary color',
            pt: 'Cor secundária',
          },
          name: 'secondaryColor',
          widget: 'color',
          required: false,
        },
        {
          label: {
            en: 'Contact email',
            pt: 'E-mail de contato',
          },
          name: 'email',
          widget: 'string',
          required: false,
        },
        {
          label: {
            en: 'Service telephone',
            pt: 'Telefone de atendimento',
          },
          name: 'phone',
          widget: 'string',
          required: false,
        },
        {
          label: {
            en: 'Store address',
            pt: 'Endereço da loja',
          },
          name: 'address',
          widget: 'string',
          required: false,
        },
        {
          label: {
            en: 'Corporate name',
            pt: 'Razão social da empresa',
          },
          name: 'corporateName',
          widget: 'string',
        },
        {
          label: {
            en: 'Store document number',
            pt: 'CNPJ',
          },
          name: 'docNumber',
          widget: 'string',
        },
        {
          label: {
            en: 'Service links',
            pt: 'Links de atendimento',
          },
          name: 'serviceLinks',
          widget: 'list',
          summary: '{{fields.title}}',
          fields: [
            {
              label: {
                en: 'Title',
                pt: 'Título',
              },
              name: 'title',
              widget: 'string',
            },
            {
              label: 'Link',
              name: 'href',
              widget: 'string',
            },
          ],
        },
        {
          label: {
            en: 'Payment methods',
            pt: 'Formas de pagamento',
          },
          name: 'paymentMethods',
          widget: 'select',
          multiple: true,
          options: [
            'pix',
            'visa',
            'mastercard',
            'elo',
            'amex',
            'hipercard',
            'boleto',
            'diners',
            'discover',
          ],
        },
        {
          label: 'WhatsApp',
          name: 'whatsapp',
          widget: 'string',
          required: false,
        },
        {
          label: 'Instagram',
          name: 'instagram',
          widget: 'string',
          required: false,
        },
        {
          label: 'Facebook',
          name: 'facebook',
          widget: 'string',
          required: false,
        },
        {
          label: 'X / Twitter',
          name: 'twitter',
          widget: 'string',
          required: false,
        },
        {
          label: 'YouTube',
          name: 'youtube',
          widget: 'string',
          required: false,
        },
        {
          label: 'TikTok',
          name: 'tiktok',
          widget: 'string',
          required: false,
        },
        {
          label: 'Pinterest',
          name: 'pinterest',
          widget: 'string',
          required: false,
        },
        {
          label: 'Threads',
          name: 'threads',
          widget: 'string',
          required: false,
        },
        {
          label: {
            en: 'Default locale',
            pt: 'Língua padrão',
          },
          name: 'lang',
          widget: 'select',
          options: [
            {
              label: 'Português',
              value: 'pt_br',
            },
            {
              label: 'Inglês',
              value: 'en_us',
            },
          ],
          default: 'pt_br',
        },
        {
          label: {
            en: 'Currency code',
            pt: 'Código da moeda',
          },
          name: 'currency',
          widget: 'hidden',
          default: 'BRL',
        },
        {
          label: {
            en: 'Currency symbol',
            pt: 'Símbolo da moeda',
          },
          name: 'currencySymbol',
          widget: 'hidden',
          default: 'R$',
        },
        {
          label: {
            en: 'Country code',
            pt: 'Código do país',
          },
          name: 'countryCode',
          widget: 'hidden',
          default: 'BR',
        },
        {
          name: 'modules',
          widget: 'hidden',
        },
        {
          name: 'cartUrl',
          widget: 'hidden',
        },
        {
          name: 'checkoutUrl',
          widget: 'hidden',
        },
        {
          name: 'accountUrl',
          widget: 'hidden',
        },
        {
          name: 'ordersUrl',
          widget: 'hidden',
        },
        {
          name: 'favoritesUrl',
          widget: 'hidden',
        },
        {
          name: 'metafields',
          widget: 'hidden',
        },
      ],
    },
    {
      name: 'layout',
      label: {
        en: 'Base layout',
        pt: 'Layout base',
      },
      file: `${baseDir}content/layout.json`,
      editor: {
        preview: false,
      },
      fields: [
        {
          name: 'header',
          label: {
            en: 'Header',
            pt: 'Cabeçalho',
          },
          widget: 'object',
          fields: [
            {
              name: 'pitchBar',
              label: {
                en: 'Pitch bar',
                pt: 'Barra de anúncios',
              },
              widget: 'list',
              minimize_collapsed: true,
              fields: [
                {
                  name: 'href',
                  label: 'Link',
                  required: false,
                  widget: 'string',
                },
                {
                  name: 'html',
                  label: {
                    en: 'Content',
                    pt: 'Conteúdo',
                  },
                  widget: 'markdown',
                  ...markdownOptions,
                  minimal: true,
                },
              ],
            },
            {
              name: 'inlineMenuCategories',
              label: {
                en: 'First menu',
                pt: 'Primeiro menu',
              },
              widget: 'object',
              fields: [
                {
                  name: 'featured',
                  label: {
                    en: 'Featured categories',
                    pt: 'Categorias em destaque',
                  },
                  widget: 'list',
                  minimize_collapsed: true,
                  label_singular: {
                    en: 'category',
                    pt: 'categoria',
                  },
                },
                {
                  name: 'random',
                  label: {
                    en: 'Max random categories',
                    pt: 'Categorias aleatórias',
                  },
                  widget: 'number',
                  default: 7,
                  value_type: 'int',
                },
              ],
            },
            {
              name: 'isAlphabeticalSortSubmenu',
              label: {
                en: 'Submenu alphabetical order',
                pt: 'Submenu em ordem alfabética',
              },
              widget: 'boolean',
              default: false,
            },
          ],
        },
      ],
    },
  ],
});

export default getConfigsColl;
