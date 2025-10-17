'use client';

import React, { useState, useMemo, DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UploadCloud } from 'lucide-react';

const AnalysisClient = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // UI State
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [metricColumn, setMetricColumn] = useState<string>('');
  const [metricType, setMetricType] = useState<'sum' | 'average' | 'count'>('sum');
  const [groupingColumn, setGroupingColumn] = useState<string>('');

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const isValidExtension = fileExtension === 'xlsx' || fileExtension === 'xls';

    if (allowedTypes.includes(selectedFile.type) || isValidExtension) {
      setFile(selectedFile);
      setData(null);
      setError(null);
      setFilterColumn('');
      setFilterValue('');
      setMetricColumn('');
      setGroupingColumn('');
    } else {
      setError('Por favor, selecciona un archivo de Excel válido (.xlsx o .xls).');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analysis/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details || 'Error processing file');
      }
      const result = await response.json();
      setData(result.data || []);

      if (result.data && result.data.length > 0) {
        const keys = Object.keys(result.data[0]);
        setFilterColumn(keys[0] || '');
        const firstNumericCol = keys.find(key => key.toLowerCase() !== 'fecha' && result.data.some((row: any) => row[key] !== null && !isNaN(parseFloat(row[key]))));
        setMetricColumn(firstNumericCol || '');
        const firstCategoricalCol = keys.find(key => result.data.some((row: any) => row[key] !== null && isNaN(parseFloat(row[key]))));
        setGroupingColumn(firstCategoricalCol || '');
      }
    } catch (err: any) {
      setError(err.message || 'Could not process the file.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {});
  }, [data]);

  const numericHeaders = useMemo(() => {
      if (!data || data.length === 0) return [];
      return headers.filter(header => 
          header.toLowerCase() !== 'fecha' && 
          data.every(row => row[header] === null || (typeof row[header] === 'string' && row[header].trim() === '') || !isNaN(parseFloat(row[header])))
      );
  }, [data, headers]);

  const categoricalHeaders = useMemo(() => {
      if (!data || data.length === 0) return [];
      return headers.filter(header => !numericHeaders.includes(header));
  }, [data, headers, numericHeaders]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!filterValue) return data;
    return data.filter(row => String(row[filterColumn] ?? '').toLowerCase().includes(filterValue.toLowerCase()));
  }, [data, filterColumn, filterValue]);

  const groupedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0 || !groupingColumn || !metricColumn) return null;

    const groups: Record<string, number[]> = filteredData.reduce((acc, row) => {
      const groupValue = row[groupingColumn] ?? 'Uncategorized';
      const metricValue = parseFloat(row[metricColumn]);
      
      if (!acc[groupValue]) acc[groupValue] = [];
      if (!isNaN(metricValue)) acc[groupValue].push(metricValue);
      return acc;
    }, {});

    return Object.entries(groups).map(([key, values]) => {
      let metricResult;
      switch (metricType) {
        case 'sum': metricResult = values.reduce((a, b) => a + b, 0); break;
        case 'average': metricResult = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
        case 'count': metricResult = values.length; break;
        default: metricResult = 0;
      }
      return { [groupingColumn]: key, Result: metricResult };
    }).sort((a, b) => String(a[groupingColumn]).localeCompare(String(b[groupingColumn])));
  }, [filteredData, groupingColumn, metricColumn, metricType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>1. Importar Datos desde Excel</CardTitle></CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDraggingOver ? 'border-primary bg-muted' : 'border-border'
            }`}
          >
            <label htmlFor="excel-file" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <div className="text-muted-foreground">
                  {file ? (
                    <p>Archivo seleccionado: <span className="font-semibold text-foreground">{file.name}</span></p>
                  ) : (
                    <p>Arrastra y suelta un archivo aquí, o <span className="font-semibold text-primary">haz clic para seleccionar</span></p>
                  )}
                  <p className="text-xs">Soportado: .xls, .xlsx</p>
                </div>
              </div>
              <Input id="excel-file" type="file" accept=".xls,.xlsx" onChange={handleInputChange} className="hidden" />
            </label>
          </div>
        </CardContent>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button onClick={handleUpload} disabled={!file || isLoading}>{isLoading ? 'Procesando...' : 'Subir y Analizar'}</Button>
          {error && <p className="text-red-500 text-sm">Error: {error}</p>}
        </CardContent>
      </Card>

      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader><CardTitle>2. Filtros</CardTitle><CardDescription>Encuentra registros específicos.</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-end space-x-2">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-sm font-medium">Columna</label>
                  <Select value={filterColumn} onValueChange={setFilterColumn}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Buscar</label>
                  <Input placeholder="Valor..." value={filterValue} onChange={e => setFilterValue(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle>3. Agrupación y Métricas</CardTitle><CardDescription>Resume tus datos por categorías.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Agrupar por</label>
                  <Select value={groupingColumn} onValueChange={setGroupingColumn}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{categoricalHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Calcular sobre</label>
                  <Select value={metricColumn} onValueChange={setMetricColumn}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{numericHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Operación</label>
                  <Select value={metricType} onValueChange={setMetricType as any}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sum">Suma</SelectItem><SelectItem value="average">Promedio</SelectItem><SelectItem value="count">Recuento</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {groupedData && groupedData.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Visualización</CardTitle>
                  <CardDescription>Gráfico de barras del resumen agrupado.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={groupedData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={groupingColumn} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => typeof value === 'number' ? value.toLocaleString() : value} />
                          <Legend />
                          <Bar dataKey="Result" fill="#8884d8" name={`Resultado (${metricType})`} />
                      </BarChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
      )}

      {groupedData && groupedData.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Resumen Agrupado</CardTitle>
                 <CardDescription>Resultado de la operación '{metricType}' en '{metricColumn}', agrupado por '{groupingColumn}'.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto max-h-96">
                    <Table>
                        <TableHeader><TableRow>{Object.keys(groupedData[0]).map(key => <TableHead key={key}>{key}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                            {groupedData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {Object.values(row).map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{typeof cell === 'number' ? cell.toLocaleString(undefined, {maximumFractionDigits: 2}) : String(cell)}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      )}

      {filteredData && filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos Completos</CardTitle>
            <CardDescription>Mostrando {filteredData.length} de {data?.length} registros.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                <TableBody>{filteredData.map((row, rowIndex) => <TableRow key={rowIndex}>{headers.map(h => <TableCell key={h}>{String(row[h] ?? '')}</TableCell>)}</TableRow>)}</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisClient;
