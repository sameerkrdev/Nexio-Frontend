/**
 * Client-side mirror of the backend payment rails config.
 * Keep in sync with: Nexio-Backend/src/config/paymentRails.ts
 */
import type { ExternalPaymentMethod } from "../services/payment.service";

export type SupportedCountryCode =
  | "IN"
  | "US"
  | "GB"
  | "EU"
  | "JP"
  | "SG"
  | "AU"
  | "CA";

export interface MethodFieldSpec {
  key: string;
  label: string;
  placeholder: string;
  helper?: string;
  keyboardType?: "default" | "number-pad" | "email-address";
  autoCapitalize?: "none" | "characters" | "words";
  maxLength?: number;
  /** Regex match required — message shown on failure */
  pattern?: { regex: RegExp; message: string };
  transform?: "upper" | "lower";
}

export interface MethodSpec {
  method: ExternalPaymentMethod;
  label: string;
  /** ETA hint shown to user */
  eta: string;
  /** Fields the user must fill */
  fields: MethodFieldSpec[];
}

export interface CountryRail {
  code: SupportedCountryCode;
  country: string;
  currency: string;
  currencySymbol: string;
  /** Dial code prefix, e.g. "+91" */
  dialCode: string;
  /** Example local number (no country code) */
  example: string;
  /** Expected length(s) of the local subscriber number */
  localNumberLengths: number[];
  methods: MethodSpec[];
  defaultMethod: ExternalPaymentMethod;
}

const upiField: MethodFieldSpec = {
  key: "upiId",
  label: "UPI ID",
  placeholder: "yourname@paytm",
  helper: "Example: 9876543210@paytm, user@ybl",
  keyboardType: "email-address",
  autoCapitalize: "none",
  pattern: {
    regex: /^[\w.-]+@[\w]+$/,
    message: "Please enter a valid UPI ID (e.g., user@paytm)",
  },
};

const ifscField: MethodFieldSpec = {
  key: "ifscCode",
  label: "IFSC Code",
  placeholder: "SBIN0001234",
  helper: "11-character bank code (e.g., HDFC0001234)",
  autoCapitalize: "characters",
  maxLength: 11,
  pattern: {
    regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    message: "Please enter a valid IFSC code",
  },
  transform: "upper",
};

const indianBankFields: MethodFieldSpec[] = [
  {
    key: "accountHolderName",
    label: "Account Holder Name",
    placeholder: "John Doe",
    autoCapitalize: "words",
  },
  {
    key: "accountNumber",
    label: "Account Number",
    placeholder: "1234567890",
    keyboardType: "number-pad",
  },
  ifscField,
  {
    key: "bankName",
    label: "Bank Name",
    placeholder: "State Bank of India",
    autoCapitalize: "words",
  },
];

export const PAYMENT_RAILS: Record<SupportedCountryCode, CountryRail> = {
  IN: {
    code: "IN",
    country: "India",
    currency: "INR",
    currencySymbol: "₹",
    dialCode: "+91",
    example: "9876543210",
    localNumberLengths: [10],
    defaultMethod: "UPI",
    methods: [
      { method: "UPI", label: "UPI", eta: "Arrives instantly", fields: [upiField] },
      { method: "IMPS", label: "IMPS", eta: "Usually within minutes", fields: indianBankFields },
      { method: "NEFT", label: "NEFT", eta: "Usually within 1-2 days", fields: indianBankFields },
      {
        method: "BANK_TRANSFER",
        label: "Bank Transfer",
        eta: "Usually within 1-2 days",
        fields: indianBankFields,
      },
    ],
  },
  US: {
    code: "US",
    country: "United States",
    currency: "USD",
    currencySymbol: "$",
    dialCode: "+1",
    example: "4155551234",
    localNumberLengths: [10],
    defaultMethod: "ACH",
    methods: [
      {
        method: "ACH",
        label: "ACH",
        eta: "Usually within 1-2 days",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "John Doe",
            autoCapitalize: "words",
          },
          {
            key: "routingNumber",
            label: "Routing Number",
            placeholder: "123456789",
            keyboardType: "number-pad",
            maxLength: 9,
            pattern: {
              regex: /^\d{9}$/,
              message: "Routing number must be 9 digits",
            },
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "000123456789",
            keyboardType: "number-pad",
          },
          {
            key: "accountType",
            label: "Account Type (checking or savings)",
            placeholder: "checking",
            autoCapitalize: "none",
            pattern: {
              regex: /^(checking|savings)$/,
              message: "Type must be 'checking' or 'savings'",
            },
          },
        ],
      },
      {
        method: "ZELLE",
        label: "Zelle",
        eta: "Usually within an hour",
        fields: [
          {
            key: "zelleEmail",
            label: "Zelle Email (or leave blank if using phone)",
            placeholder: "user@example.com",
            keyboardType: "email-address",
            autoCapitalize: "none",
          },
        ],
      },
      {
        method: "WIRE",
        label: "Wire",
        eta: "Usually within 1-2 days",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "John Doe",
            autoCapitalize: "words",
          },
          {
            key: "routingNumber",
            label: "Routing Number",
            placeholder: "123456789",
            keyboardType: "number-pad",
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "000123456789",
            keyboardType: "number-pad",
          },
          {
            key: "bankName",
            label: "Bank Name",
            placeholder: "Chase Bank",
            autoCapitalize: "words",
          },
        ],
      },
    ],
  },
  GB: {
    code: "GB",
    country: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    dialCode: "+44",
    example: "7700900123",
    localNumberLengths: [10],
    defaultMethod: "FASTER_PAYMENTS",
    methods: [
      {
        method: "FASTER_PAYMENTS",
        label: "Faster Payments",
        eta: "Usually within minutes",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "John Smith",
            autoCapitalize: "words",
          },
          {
            key: "sortCode",
            label: "Sort Code",
            placeholder: "12-34-56",
            keyboardType: "number-pad",
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "12345678",
            keyboardType: "number-pad",
          },
        ],
      },
    ],
  },
  EU: {
    code: "EU",
    country: "Europe (SEPA)",
    currency: "EUR",
    currencySymbol: "€",
    dialCode: "+49",
    example: "15123456789",
    localNumberLengths: [10, 11],
    defaultMethod: "SEPA",
    methods: [
      {
        method: "SEPA",
        label: "SEPA",
        eta: "Usually within 1-2 days",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "Max Mustermann",
            autoCapitalize: "words",
          },
          {
            key: "iban",
            label: "IBAN",
            placeholder: "DE89370400440532013000",
            autoCapitalize: "characters",
            transform: "upper",
            pattern: {
              regex: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
              message: "Enter a valid IBAN",
            },
          },
        ],
      },
      {
        method: "SEPA_INSTANT",
        label: "SEPA Instant",
        eta: "Arrives instantly",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "Max Mustermann",
            autoCapitalize: "words",
          },
          {
            key: "iban",
            label: "IBAN",
            placeholder: "DE89370400440532013000",
            autoCapitalize: "characters",
            transform: "upper",
            pattern: {
              regex: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
              message: "Enter a valid IBAN",
            },
          },
        ],
      },
    ],
  },
  JP: {
    code: "JP",
    country: "Japan",
    currency: "JPY",
    currencySymbol: "¥",
    dialCode: "+81",
    example: "9012345678",
    localNumberLengths: [10],
    defaultMethod: "ZENGIN",
    methods: [
      {
        method: "ZENGIN",
        label: "Zengin",
        eta: "Usually within 1-2 days",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "Yamada Taro",
            autoCapitalize: "words",
          },
          {
            key: "bankCode",
            label: "Bank Code",
            placeholder: "0001",
            keyboardType: "number-pad",
          },
          {
            key: "branchCode",
            label: "Branch Code",
            placeholder: "001",
            keyboardType: "number-pad",
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "1234567",
            keyboardType: "number-pad",
          },
        ],
      },
    ],
  },
  SG: {
    code: "SG",
    country: "Singapore",
    currency: "SGD",
    currencySymbol: "S$",
    dialCode: "+65",
    example: "91234567",
    localNumberLengths: [8],
    defaultMethod: "PAYNOW",
    methods: [
      {
        method: "PAYNOW",
        label: "PayNow",
        eta: "Arrives instantly",
        fields: [
          {
            key: "paynowId",
            label: "PayNow ID (phone, NRIC, or UEN)",
            placeholder: "+6591234567",
          },
        ],
      },
      {
        method: "FAST",
        label: "FAST",
        eta: "Arrives instantly",
        fields: [
          {
            key: "paynowId",
            label: "PayNow ID",
            placeholder: "+6591234567",
          },
        ],
      },
    ],
  },
  AU: {
    code: "AU",
    country: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
    dialCode: "+61",
    example: "412345678",
    localNumberLengths: [9],
    defaultMethod: "OSKO",
    methods: [
      {
        method: "OSKO",
        label: "Osko",
        eta: "Usually within minutes",
        fields: [
          {
            key: "accountHolderName",
            label: "Account Holder Name",
            placeholder: "Jane Doe",
            autoCapitalize: "words",
          },
          {
            key: "bsb",
            label: "BSB",
            placeholder: "062-001",
            keyboardType: "number-pad",
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "12345678",
            keyboardType: "number-pad",
          },
        ],
      },
    ],
  },
  CA: {
    code: "CA",
    country: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    dialCode: "+1",
    example: "4165551234",
    localNumberLengths: [10],
    defaultMethod: "INTERAC",
    methods: [
      {
        method: "INTERAC",
        label: "Interac e-Transfer",
        eta: "Usually within an hour",
        fields: [
          {
            key: "email",
            label: "Recipient Email",
            placeholder: "user@example.com",
            keyboardType: "email-address",
            autoCapitalize: "none",
            pattern: {
              regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email",
            },
          },
        ],
      },
      {
        method: "EFT",
        label: "EFT",
        eta: "Usually within 1-2 days",
        fields: [
          {
            key: "transitNumber",
            label: "Transit Number",
            placeholder: "12345",
            keyboardType: "number-pad",
            maxLength: 5,
          },
          {
            key: "institutionNumber",
            label: "Institution Number",
            placeholder: "001",
            keyboardType: "number-pad",
            maxLength: 3,
          },
          {
            key: "accountNumber",
            label: "Account Number",
            placeholder: "1234567",
            keyboardType: "number-pad",
          },
        ],
      },
    ],
  },
};

export const SUPPORTED_COUNTRY_LIST: SupportedCountryCode[] = [
  "IN",
  "US",
  "GB",
  "EU",
  "JP",
  "SG",
  "AU",
  "CA",
];

export const getRail = (code: SupportedCountryCode): CountryRail => PAYMENT_RAILS[code];

/** Build an E.164 phone string from a country rail + local digits */
export const buildE164 = (rail: CountryRail, localDigits: string): string => {
  const cleaned = localDigits.replace(/\D/g, "");
  return `${rail.dialCode}${cleaned}`;
};
