export interface MarketingImage {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}

// Editorial illustrations provide sector context. These are not client
// premises or screenshots of the software described in the case studies.
export const marketingImages = {
  workspace: {
    src: "/images/marketing/software-workspace.png",
    alt: "A considered workspace with a graphite laptop, phone and notebook in natural light",
    caption:
      "Software delivery, from the first idea to the tools your team uses.",
  },
  fleet: {
    src: "/images/marketing/fleet-operations.png",
    alt: "An illustrative fleet of graphite and silver cars outside a contemporary operations depot",
    caption: "Fleet operations · Illustrative industry visual",
  },
  automotive: {
    src: "/images/marketing/automotive-booking.png",
    alt: "Illustrative automotive service work with a technician detailing a graphite car",
    caption: "Automotive services · Illustrative industry visual",
  },
  retail: {
    src: "/images/marketing/retail-operations.png",
    alt: "An illustrative retail workspace with a laptop on a walnut shop counter",
    caption: "Retail operations · Illustrative industry visual",
  },
} satisfies Record<string, MarketingImage>;

export const serviceImages: Record<string, MarketingImage> = {
  "custom-business-software-warsaw": marketingImages.workspace,
  "fleet-management-software": marketingImages.fleet,
  "booking-reservation-systems": marketingImages.automotive,
  "business-process-automation": marketingImages.workspace,
  "pos-inventory-software": marketingImages.retail,
  "web-mobile-development": marketingImages.workspace,
};
