declare module "@kyungseopk1m/holidays-kr" {
  export const holidays: (
    year: string,
    year2?: string
  ) => Promise<{ success: boolean; message: string; data: any[] }>;
}
