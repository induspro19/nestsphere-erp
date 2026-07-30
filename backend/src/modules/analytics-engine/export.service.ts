import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  formatAsCsv(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  }
}
