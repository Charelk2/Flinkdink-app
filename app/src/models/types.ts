export type ChildProfile = {
    id: string;
    name: string;
    birthday: string; // ISO format
    avatar: string;   // emoji or image ID
    createdAt: number;
  };
  
  
  export type ProgressEntry = {
    week: number;
    completed: boolean;
    updatedAt: number;
  };
  
  export type ProfileProgress = {
    [week: string]: ProgressEntry;
  };
  