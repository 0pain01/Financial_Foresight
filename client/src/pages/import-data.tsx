import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log("Uploading CSV file:", file.name);
      
      const response = await fetch("http://localhost:8080/api/import/csv", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: `Successfully imported ${data.imported} transactions`
      });
      setFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import transactions",
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const downloadTemplate = () => {
    const csvContent = "date,description,amount,category,type,paymentMethod\n15-01-2024,Grocery Store,-85.50,Food & Dining,expense,Credit Card\n16-01-2024,Salary,3000.00,Income,income,Direct Deposit\n17-01-2024,Gas Station,-45.00,Transportation,expense,Credit Card";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground">Import Data</h1>
          <p className="text-muted-foreground">Import transactions from CSV files or connect to your bank</p>
          </div>

          {/* CSV Upload */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="file-upload">Select CSV File</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-finance-blue hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-finance-blue">
                          <span>Upload a file</span>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                                              <p className="text-xs text-muted-foreground">CSV files only</p>
                    </div>
                  </div>
                </div>

                {file && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{file.name}</p>
                        <p className="text-xs text-blue-600">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploadMutation.isPending}
                    className="bg-finance-blue hover:bg-blue-700"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Format Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                CSV Format Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900">Required Columns</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your CSV file must include these columns: date, description, amount, category, type, paymentMethod
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Column</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Example</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">date</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">YYYY-MM-DD</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">2024-01-15</td>
                      </tr>
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">description</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Text</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Grocery Store</td>
                      </tr>
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">amount</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Number (negative for expenses)</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">-85.50</td>
                      </tr>
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">category</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Text</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Food & Dining</td>
                      </tr>
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">type</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">income or expense</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">expense</td>
                      </tr>
                      <tr>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">paymentMethod</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Text</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Credit Card</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Connection (Future Feature) */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                  Connect directly to your bank account for automatic transaction imports
                </p>
                <Button variant="outline" disabled>
                  Connect Bank Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}