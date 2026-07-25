export interface Region {
  name: string;
  uuid: string;
}

export interface Deanery {
  name: string;
  uuid: string;
}

export type AdminType = "super" | "finance" | "academic" | "administrative";

export interface ArchdioceseAdminRecord {
  name: string;
  email: string;
  uuid: string;
  type: "super" | "finance" | "academic";
}

export interface Parish {
  uuid: string;
  parish_name: string;
  slug: string;
}

export interface Course {
  uuid: string;
  name: string;
}

export interface Module {
  name: string;
  uuid: string;
  pass_mark: number;
}

export interface Topic {
  uuid: string;
  name: string;
}

export interface Material {
  uuid: string;
  name: string;
  type: "document" | "video" | "audio" | "image";
  filename: string;
}

export interface Exercise {
  uuid: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
}

export interface RegionAdminRecord {
  uuid: string;
  name: string;
  email: string;
  type: "administrative" | "academic";
  region: { uuid: string; name: string } | null;
}

export interface DeaneryAdminRecord {
  name: string;
  email: string;
  uuid: string;
  type: "administrative" | "academic";
}

export interface Paginated<T> {
  current_page: number;
  last_page: number;
  total: number;
  data: T[];
}
