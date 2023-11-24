/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Triggered to handle checkout with billing and shipping and create new order
 */
export interface CheckoutBody {
  /**
   * @maxItems 3000
   */
  items: {
    /**
     * Product ID
     */
    product_id: string;
    /**
     * ID to specify the variation added to cart, if product has variations
     */
    variation_id?: string;
    /**
     * Item quantity in cart
     */
    quantity: number;
    /**
     * Warehouses by code and respective product stock
     */
    inventory?: {
      /**
       * Product quantity available for sale from current warehouse
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^[A-Za-z0-9-_]{2,30}$".
       */
      [k: string]: number;
    };
    /**
     * Product or variation picture for this cart item
     */
    picture?: {
      /**
       * Image size variation
       *
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` "^small|normal|big|zoom|custom$".
       */
      [k: string]: {
        /**
         * Image link
         */
        url: string;
        /**
         * Image size (width x height) in px, such as 100x50 (100px width, 50px height)
         */
        size?: string;
        /**
         * Alternative text, HTML alt tag (important for SEO)
         */
        alt?: string;
      };
    };
    /**
     * Item customization fields
     *
     * @maxItems 100
     */
    customizations?: {
      /**
       * Customization field ID
       */
      _id: string;
      /**
       * Title for this customization field, can be the grid title
       */
      label?: string;
      /**
       * Option chosen or created by customer
       */
      option: {
        /**
         * Identify option if it was predefined (not custom value created by customer)
         */
        option_id?: string;
        /**
         * Option text value displayed for the client
         */
        text: string;
        /**
         * Option color palette (if the field involves colors), starting by main color
         *
         * @maxItems 6
         */
        colors?: string[];
      };
      /**
       * URL of file attached by customer to this field
       */
      attachment?: string;
      /**
       * Price alteration due to this customization
       */
      add_to_price?: {
        /**
         * Type of price addition
         */
        type?: 'percentage' | 'fixed';
        /**
         * Additional value, could be negative
         */
        addition: number;
      };
    }[];
    /**
     * Parent kit product for this item
     */
    kit_product?: {
      /**
       * Kit product ID
       */
      _id: string;
      /**
       * Kit product full name
       */
      name?: string;
      /**
       * Total quantity of items to close a kit unit
       */
      pack_quantity?: number;
      /**
       * Kit total price
       */
      price?: number;
    };
    /**
     * Gift wrap chosen by customer
     */
    gift_wrap?: {
      /**
       * Tag to identify object, use only lowercase letters, digits and underscore
       */
      tag?: string;
      /**
       * Title describing this gift wrap
       */
      label: string;
      /**
       * Additional value due to this gift wrap
       */
      add_to_price?: number;
    };
    /**
     * Flags to associate additional info
     *
     * @maxItems 10
     */
    flags?: string[];
  }[];
  /**
   * Shipping options to calculate freight and deadline
   */
  shipping: {
    /**
     * ID of application chosen for shipping
     */
    app_id: number;
    from?: Address;
    to: Address1;
    /**
     * Whether the package must be delivered with additional service "own hand"
     */
    own_hand?: boolean;
    /**
     * If the package will be delivered with acknowledgment of receipt
     */
    receipt?: boolean;
    /**
     * Code of service defined by carrier, if shipping method is already defined
     */
    service_code?: string;
  };
  /**
   * Payment options to create transaction(s)
   */
  transaction: Transaction | Transaction[];
  /**
   * Extra discount to apply by coupon or UTM campaign
   */
  discount?: {
    /**
     * ID of application chosen for extra discount
     */
    app_id?: number;
    /**
     * Text of discount coupon applied by customer
     */
    discount_coupon?: string;
  };
  /**
   * Designator of currency according to ISO 4217 (3 uppercase letters)
   */
  currency_id?: string;
  /**
   * Graphic symbol used as a shorthand for currency's name
   */
  currency_symbol?: string;
  /**
   * Language two letters code, sometimes with region, eg.: pt_br, fr, en_us
   */
  lang?: string;
  /**
   * UTM campaign HTTP parameters
   */
  utm?: {
    /**
     * Parameter "utm_source", the referrer: (e.g. google, newsletter)
     */
    source?: string;
    /**
     * Parameter "utm_medium", the marketing medium: (e.g. cpc, banner, email)
     */
    medium?: string;
    /**
     * Parameter "utm_campaign", the product, promo code, or slogan (e.g. spring_sale)
     */
    campaign?: string;
    /**
     * Parameter "utm_term", identifies the paid keywords
     */
    term?: string;
    /**
     * Parameter "utm_content", used to differentiate ads
     */
    content?: string;
  };
  /**
   * Code to identify the affiliate that referred the customer
   */
  affiliate_code?: string;
  /**
   * Channel unique identificator
   */
  channel_id?: number;
  /**
   * Channel type or source
   */
  channel_type?: 'ecommerce' | 'mobile' | 'pdv' | 'button' | 'facebook' | 'chatbot';
  /**
   * Store domain name (numbers and lowercase letters, eg.: www.myshop.sample)
   */
  domain?: string;
  /**
   * Optional notes with additional info about this order
   */
  notes?: string;
  /**
   * Customer object
   */
  customer: {
    /**
     * Customer ID
     */
    _id?: null | string;
    /**
     * Customer language two letter code, sometimes with region, eg.: pt_br, fr, en_us
     */
    locale?: string;
    /**
     * Customer main email address
     */
    main_email: string;
    /**
     * List of customer email addresses
     *
     * @maxItems 20
     */
    emails?: {
      /**
       * The actual email address
       */
      address: string;
      /**
       * The type of email
       */
      type?: 'work' | 'home' | 'other';
      /**
       * States whether or not the email address has been verified
       */
      verified?: boolean;
    }[];
    /**
     * The name of this Customer, suitable for display
     */
    display_name?: string;
    /**
     * Customer name object
     */
    name: {
      /**
       * The family name of this user, or "last name"
       */
      family_name?: string;
      /**
       * The "first name" of this user
       */
      given_name?: string;
      /**
       * The middle name(s) of this user
       */
      middle_name?: string;
    };
    /**
     * Customer gender, female, male or third gender (X)
     */
    gender?: 'f' | 'm' | 'x';
    /**
     * User profile pictures
     *
     * @maxItems 20
     */
    photos?: string[];
    /**
     * List of customer phone numbers
     *
     * @maxItems 20
     */
    phones?: {
      /**
       * Country calling code (without +), defined by standards E.123 and E.164
       */
      country_code?: number;
      /**
       * The actual phone number, digits only
       */
      number: string;
      /**
       * The type of phone
       */
      type?: 'home' | 'personal' | 'work' | 'other';
    }[];
    /**
     * Physical or juridical (company) person
     */
    registry_type?: 'p' | 'j';
    /**
     * Country of document origin, an ISO 3166-2 code
     */
    doc_country?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number?: string;
    /**
     * Municipal or state registration if exists
     */
    inscription_type?: 'State' | 'Municipal';
    /**
     * Municipal or state registration number (with characters) if exists
     */
    inscription_number?: string;
    /**
     * Registered company name or responsible fullname
     */
    corporate_name?: string;
    /**
     * ID of customer who invited the new customer, if he was invited by another account
     */
    referral?: string;
  };
}
/**
 * Sender's address
 */
export interface Address {
  /**
   * ZIP (CEP, postal...) code
   */
  zip: string;
  /**
   * Street or public place name
   */
  street?: string;
  /**
   * House or building street number
   */
  number?: number;
  /**
   * Address complement or second line, such as apartment number
   */
  complement?: string;
  /**
   * Borough name
   */
  borough?: string;
  /**
   * Some optional other reference for this address
   */
  near_to?: string;
  /**
   * Full in line mailing address, should include street, number and borough
   */
  line_address?: string;
  /**
   * City name
   */
  city?: string;
  /**
   * Country name
   */
  country?: string;
  /**
   * An ISO 3166-2 country code
   */
  country_code?: string;
  /**
   * Province or state name
   */
  province?: string;
  /**
   * The two-letter code for the province or state
   */
  province_code?: string;
  /**
   * The name of recipient, generally is the customer's name
   */
  name?: string;
  /**
   * The recipient's last name
   */
  last_name?: string;
  /**
   * Customer phone number for this mailing address
   */
  phone?: {
    /**
     * Country calling code (without +), defined by standards E.123 and E.164
     */
    country_code?: number;
    /**
     * The actual phone number, digits only
     */
    number: string;
  };
}
/**
 * Shipping address (recipient)
 */
export interface Address1 {
  /**
   * ZIP (CEP, postal...) code
   */
  zip: string;
  /**
   * Street or public place name
   */
  street?: string;
  /**
   * House or building street number
   */
  number?: number;
  /**
   * Address complement or second line, such as apartment number
   */
  complement?: string;
  /**
   * Borough name
   */
  borough?: string;
  /**
   * Some optional other reference for this address
   */
  near_to?: string;
  /**
   * Full in line mailing address, should include street, number and borough
   */
  line_address?: string;
  /**
   * City name
   */
  city?: string;
  /**
   * Country name
   */
  country?: string;
  /**
   * An ISO 3166-2 country code
   */
  country_code?: string;
  /**
   * Province or state name
   */
  province?: string;
  /**
   * The two-letter code for the province or state
   */
  province_code?: string;
  /**
   * The name of recipient, generally is the customer's name
   */
  name?: string;
  /**
   * The recipient's last name
   */
  last_name?: string;
  /**
   * Customer phone number for this mailing address
   */
  phone?: {
    /**
     * Country calling code (without +), defined by standards E.123 and E.164
     */
    country_code?: number;
    /**
     * The actual phone number, digits only
     */
    number: string;
  };
}
/**
 * Transaction options object
 */
export interface Transaction {
  /**
   * ID of application chosen for transaction
   */
  app_id: number;
  /**
   * Transaction type
   */
  type?: 'payment' | 'recurrence';
  /**
   * Chosen payment method object
   */
  payment_method: {
    /**
     * Standardized payment method code
     */
    code:
      | 'credit_card'
      | 'banking_billet'
      | 'online_debit'
      | 'account_deposit'
      | 'debit_card'
      | 'balance_on_intermediary'
      | 'loyalty_points'
      | 'other';
    /**
     * Short description for payment method
     */
    name?: string;
  };
  /**
   * Name of payment method shown to customers
   */
  label?: string;
  /**
   * Payment icon image URI
   */
  icon?: string;
  /**
   * Payment intermediator
   */
  intermediator?: {
    /**
     * Name of payment intermediator
     */
    name?: string;
    /**
     * URI to intermediator website
     */
    link?: string;
    /**
     * Gateway name standardized as identification code
     */
    code: string;
  };
  /**
   * Base URI to payments
   */
  payment_url?: string;
  /**
   * Order buyer info
   */
  buyer: {
    /**
     * Customer ID in the store
     */
    customer_id?: string;
    /**
     * Buyer email address
     */
    email: string;
    /**
     * Customer full name or company corporate name
     */
    fullname: string;
    /**
     * Customer gender, female, male or third gender (X)
     */
    gender?: 'f' | 'm' | 'x';
    /**
     * Date of customer birth
     */
    birth_date: {
      /**
       * Day of birth
       */
      day?: number;
      /**
       * Number of month of birth
       */
      month?: number;
      /**
       * Year of birth
       */
      year?: number;
    };
    /**
     * Buyer contact phone
     */
    phone: {
      /**
       * Country calling code (without +), defined by standards E.123 and E.164
       */
      country_code?: number;
      /**
       * The actual phone number, digits only
       */
      number: string;
      /**
       * The type of phone
       */
      type?: 'home' | 'personal' | 'work' | 'other';
    };
    /**
     * Physical or juridical (company) person
     */
    registry_type: 'p' | 'j';
    /**
     * Country of document origin, an ISO 3166-2 code
     */
    doc_country?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number: string;
    /**
     * Municipal or state registration if exists
     */
    inscription_type?: 'State' | 'Municipal';
    /**
     * Municipal or state registration number (with characters) if exists
     */
    inscription_number?: string;
  };
  /**
   * Transation payer info
   */
  payer?: {
    /**
     * Payer full name or company corporate name
     */
    fullname?: string;
    /**
     * Date of payer birth
     */
    birth_date?: {
      /**
       * Day of birth
       */
      day?: number;
      /**
       * Number of month of birth
       */
      month?: number;
      /**
       * Year of birth
       */
      year?: number;
    };
    /**
     * Payer contact phone
     */
    phone?: {
      /**
       * Country calling code (without +), defined by standards E.123 and E.164
       */
      country_code?: number;
      /**
       * The actual phone number, digits only
       */
      number: string;
      /**
       * The type of phone
       */
      type?: 'home' | 'personal' | 'work' | 'other';
    };
    /**
     * Physical or juridical (company) person
     */
    registry_type?: 'p' | 'j';
    /**
     * Country of document origin, an ISO 3166-2 code
     */
    doc_country?: string;
    /**
     * Responsible person or organization document number (only numbers)
     */
    doc_number?: string;
  };
  /**
   * ID of customer account in the intermediator
   */
  intermediator_buyer_id?: string;
  billing_address?: Address2;
  to?: Address3;
  /**
   * Credit card data, if payment will be done with credit card
   */
  credit_card?: {
    /**
     * Full name of the holder, as it is on the credit card
     */
    holder_name?: string;
    /**
     * Issuer identification number (IIN), known as bank identification number (BIN)
     */
    bin?: number;
    /**
     * Credit card issuer name, eg.: Visa, American Express, MasterCard
     */
    company?: string;
    /**
     * Last digits (up to 4) of credit card number
     */
    last_digits?: string;
    /**
     * Unique credit card token
     */
    token?: string;
    /**
     * Credit card CVV number (Card Verification Value)
     */
    cvv?: number;
    /**
     * Credit card encrypted hash
     */
    hash?: string;
    /**
     * Whether the hashed credit card should be saved for further use
     */
    save?: boolean;
  };
  /**
   * Number of installments chosen
   */
  installments_number?: number;
  /**
   * Customer's loyalty points used, program ID as property
   */
  loyalty_points_applied?: {
    /**
     * Number of loyalty points used
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-z0-9_]{2,30}$".
     */
    [k: string]: number;
  };
  /**
   * Payment or order ID if pre committed on gateway (authorization/capture)
   */
  open_payment_id?: string;
  /**
   * Numeric part (multiplier) for final amount when ordering with 2+ transactions
   */
  amount_part?: number;
}
/**
 * The mailing address associated with the payment method
 */
export interface Address2 {
  /**
   * ZIP (CEP, postal...) code
   */
  zip: string;
  /**
   * Street or public place name
   */
  street?: string;
  /**
   * House or building street number
   */
  number?: number;
  /**
   * Address complement or second line, such as apartment number
   */
  complement?: string;
  /**
   * Borough name
   */
  borough?: string;
  /**
   * Some optional other reference for this address
   */
  near_to?: string;
  /**
   * Full in line mailing address, should include street, number and borough
   */
  line_address?: string;
  /**
   * City name
   */
  city?: string;
  /**
   * Country name
   */
  country?: string;
  /**
   * An ISO 3166-2 country code
   */
  country_code?: string;
  /**
   * Province or state name
   */
  province?: string;
  /**
   * The two-letter code for the province or state
   */
  province_code?: string;
  /**
   * The name of recipient, generally is the customer's name
   */
  name?: string;
  /**
   * The recipient's last name
   */
  last_name?: string;
  /**
   * Customer phone number for this mailing address
   */
  phone?: {
    /**
     * Country calling code (without +), defined by standards E.123 and E.164
     */
    country_code?: number;
    /**
     * The actual phone number, digits only
     */
    number: string;
  };
}
/**
 * Shipping address (recipient)
 */
export interface Address3 {
  /**
   * ZIP (CEP, postal...) code
   */
  zip: string;
  /**
   * Street or public place name
   */
  street?: string;
  /**
   * House or building street number
   */
  number?: number;
  /**
   * Address complement or second line, such as apartment number
   */
  complement?: string;
  /**
   * Borough name
   */
  borough?: string;
  /**
   * Some optional other reference for this address
   */
  near_to?: string;
  /**
   * Full in line mailing address, should include street, number and borough
   */
  line_address?: string;
  /**
   * City name
   */
  city?: string;
  /**
   * Country name
   */
  country?: string;
  /**
   * An ISO 3166-2 country code
   */
  country_code?: string;
  /**
   * Province or state name
   */
  province?: string;
  /**
   * The two-letter code for the province or state
   */
  province_code?: string;
  /**
   * The name of recipient, generally is the customer's name
   */
  name?: string;
  /**
   * The recipient's last name
   */
  last_name?: string;
  /**
   * Customer phone number for this mailing address
   */
  phone?: {
    /**
     * Country calling code (without +), defined by standards E.123 and E.164
     */
    country_code?: number;
    /**
     * The actual phone number, digits only
     */
    number: string;
  };
}
