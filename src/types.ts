export type ActiveTab = "home" | "cms" | "vtuber" | "tos";

export interface SocialItem {
  t: string; // "twitter" | "bluesky" | "facebook" | "instagram" | "link"
  u: string; // url link string
}

export interface IllustRow {
  type: string;
  rough: string;
  color: string;
}

export interface YchItem {
  name: string;
  image: string;
  desc: string;
  price: string;
}

export interface VtuberFullbodyRow {
  type: string;
  price: string;
}

export interface VtuberExtraPartRow {
  type: string;
  art: string;
  rigging: string;
}

export interface PortfolioData {
  name: string;
  avatarImg: string;
  statusIllust: "open" | "limited" | "closed";
  statusLive2d: "open" | "limited" | "closed";
  svcIllustThumb: string;
  svcYchThumb: string;
  socials: SocialItem[];
  doList: string[];
  dontList: string[];
  illustNote: string;
  illustStatus: "open" | "limited" | "closed";
  illustSlides: string[];
  illustRows: IllustRow[];
  illustExamples: string[];
  ychStatus: "open" | "limited" | "closed";
  ychNote: string;
  ychItems: YchItem[];
  ychExamples: string[];
  vtuberText: string;
  vtuberMainImg?: string;
  vtuberExample1?: string;
  vtuberExample2?: string;
  vtuberFullbodyRows?: VtuberFullbodyRow[];
  vtuberExtraParts?: VtuberExtraPartRow[];
  vtuberPrivacyFee?: string;
  vtuberDesignNote?: string;
  tos: string[];
  contactText?: string;
  imageStyles?: Record<string, ImageStyleConfig>;
}

export interface ImageStyleConfig {
  scale?: number;     // zoom offset (default 100%)
  posX?: number;      // focus position X offset (default 50%)
  posY?: number;      // focus position Y offset (default 50%)
  fit?: "cover" | "contain";
}

