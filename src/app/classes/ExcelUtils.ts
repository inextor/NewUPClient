/**
 * ExcelUtils - TypeScript wrapper for public/js/excelUtils.js functions
 *
 * This class provides type-safe static methods that call the global JavaScript
 * functions defined in public/js/excelUtils.js
 *
 * NOTE: Ensure that public/js/excelUtils.js is loaded in index.html before using these methods
 */

// Declare global functions from excelUtils.js
declare function xlsx2json(file: File, headers: string[]): Promise<any[]>;
declare function xlsx2RawRows(file: File): Promise<any[]>;
declare function array2xlsx(array: any[], filename: string, headers: string[]): void;

export class ExcelUtils {
  /**
   * Converts an Excel file to JSON format
   * @param file - The Excel file to convert
   * @param headers - Array of header names to use for the JSON objects
   * @returns Promise resolving to an array of objects (first row is skipped)
   */
  static xlsx2json(file: File, headers: string[]): Promise<any[]> {
    return xlsx2json(file, headers);
  }

  /**
   * Converts an Excel file to raw rows (2D array)
   * @param file - The Excel file to convert
   * @returns Promise resolving to a 2D array of raw row data
   */
  static xlsx2RawRows(file: File): Promise<any[]> {
    return xlsx2RawRows(file);
  }

  /**
   * Converts an array of objects to an Excel file and triggers download
   * @param array - Array of objects to export
   * @param filename - Name of the Excel file to create (e.g., "data.xlsx")
   * @param headers - Array of header names for the columns
   */
  static array2xlsx(array: any[], filename: string, headers: string[]): void {
    array2xlsx(array, filename, headers);
  }
}
