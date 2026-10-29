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

export interface Term {
  name: string;
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
}

export interface Parish {
  uuid: string;
  parish_name: string;
  slug: string;
}

export interface Parishioner {
  uuid?: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;
  phone: string;
  parish_code: string;
  deactivated?: "yes" | "no"; 
  created_at: string;
}

export interface HierarchyDeanery {
  uuid: string;
  name: string;
  parish_count: number;
}

export interface HierarchyRegion {
  uuid: string;
  name: string;
  deaneries: HierarchyDeanery[];
}

export interface HierarchyParish {
  uuid: string;
  parish_name: string;
  slug: string;
  parishioners_count: number;
}

export interface DirectoryParishioner {
  parish_code: string;
  name: string;
  email: string;
  status: "active" | "pending";
  courses_count: number;
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

export interface Question {
  uuid: string;
  question_text: string;
  marks: number | null;
}

export interface ExamListItem {
  uuid: string;
  title: string;
  pass_mark: number;
  allow_multiple_attempts: boolean;
  opens_at: string | null;
  closes_at: string | null;
  module: {
    uuid: string;
    name: string;
    course: { name: string };
  };
}

export interface ExamOption {
  uuid: string;
  option_text: string;
  is_correct: boolean;
}

export interface ExamQuestionRecord {
  uuid: string;
  question_text: string;
  marks: number;
  order: number;
  options: ExamOption[];
}

export interface ExamRecord {
  uuid: string;
  title: string;
  instructions: string | null;
  pass_mark: number;
  allow_multiple_attempts: boolean;
  opens_at: string | null;
  closes_at: string | null;
  questions_count?: number;
}

export interface RegionAdminRecord {
  uuid: string;
  name: string;
  email: string;
  type: "administrative" | "academic";
  region: { uuid: string; name: string } | null;
}

export interface RegionDirectoryOverview {
  uuid: string;
  name: string;
  deaneries: HierarchyDeanery[];
}

export interface DeaneryAdminRecord {
  name: string;
  email: string;
  uuid: string;
  type: "administrative" | "academic";
}

export interface DeaneryHierarchyData {
  uuid: string;
  name: string;
  region_name: string | null;
  parishes: HierarchyParish[];
}

export interface Paginated<T> {
  current_page: number;
  last_page: number;
  total: number;
  data: T[];
}

export interface ModuleResult {
  module_uuid: string;
  module_name: string;
  course_name: string | null;
  term_name: string | null;
  term_status: "active" | "ended" | null;
  final_percentage: number;
  pass_mark: number;
  passed: boolean;
}

export interface ExamResult {
  module_uuid: string;
  module_name: string;
  course_uuid: string;
  course_name: string;
  term_name: string | null;
  exam_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
}

export interface ExerciseResult {
  exercise_uuid: string;
  title: string;
  due_date: string | null;
  module_name: string;
  course_uuid: string;
  course_name: string;
  status: "graded" | "pending";
  score: number | null;
  total_marks: number | null;
  attempt_number: number;
}
