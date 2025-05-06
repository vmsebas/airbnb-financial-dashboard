
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { analyzeTableColumns } from '@/services/airtableService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const AirtableAnalyzer = () => {
  const [columnData, setColumnData] = useState<{
    columnNames: string[];
    sampleValues: Record<string, any>;
  }>({ columnNames: [], sampleValues: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumnData = async () => {
      try {
        setLoading(true);
        const data = await analyzeTableColumns();
        setColumnData(data);
      } catch (err) {
        console.error('Error al analizar las columnas:', err);
        setError('Error al recuperar los datos de Airtable');
      } finally {
        setLoading(false);
      }
    };

    fetchColumnData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-xl">Analizando columnas de Airtable...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rental-primary text-white rounded"
          >
            Reintentar
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Analizador de Columnas de Airtable</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Columnas Detectadas: {columnData.columnNames.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columnData.columnNames.map((columnName) => (
              <Card key={columnName} className="overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-rental-primary">{columnName}</h3>
                  <Separator className="my-2" />
                  <div className="text-sm">
                    <p className="text-gray-500">Ejemplo:</p>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {columnData.sampleValues[columnName] !== null && columnData.sampleValues[columnName] !== undefined
                        ? typeof columnData.sampleValues[columnName] === 'object'
                          ? JSON.stringify(columnData.sampleValues[columnName])
                          : String(columnData.sampleValues[columnName])
                        : 'null'}
                    </p>
                    <p className="text-gray-500 mt-2">Tipo:</p>
                    <p>
                      {columnData.sampleValues[columnName] !== null && columnData.sampleValues[columnName] !== undefined
                        ? Array.isArray(columnData.sampleValues[columnName])
                          ? 'Array'
                          : typeof columnData.sampleValues[columnName]
                        : 'null'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default AirtableAnalyzer;
