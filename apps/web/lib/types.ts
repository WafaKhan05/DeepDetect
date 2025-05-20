export interface Upload {
  id: string;
  file_name: string;
  file_location: string;
  uploaded_on: string;
  file_type: string;
  status: string;
  confidence?: string | null;
  prediction?: string | null;
  result?: string | null;
  analysis_completed_on?: string | null;
}
