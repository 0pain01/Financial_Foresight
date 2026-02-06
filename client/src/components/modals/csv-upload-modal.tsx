import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CSVUploadModal({ isOpen, onClose }: CSVUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('http://localhost:8080/api/transactions/upload-csv', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: data.message || "CSV file uploaded successfully"
      });
      setSelectedFile(null);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload CSV file",
        variant: "destructive"
      });
    }
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Import CSV File</DialogTitle>
        </DialogHeader>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-finance-blue bg-blue-50' : 'border-gray-300 hover:border-finance-blue'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-finance-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="text-finance-blue h-8 w-8" />
          </div>
          
          {selectedFile ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
              <p className="text-gray-600 mb-4">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 mb-4">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your CSV file here</h3>
              <p className="text-gray-500 mb-4">or click to browse files</p>
            </div>
          )}
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            id="csvFileInput"
            onChange={handleFileSelect}
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('csvFileInput')?.click()}
            disabled={uploadMutation.isPending}
          >
            Choose File
          </Button>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-finance-blue mb-2">CSV Format Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Date, Description, Amount, Category columns</li>
            <li>• Amount should be negative for expenses, positive for income</li>
            <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
          </ul>
        </div>
        
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-finance-blue hover:bg-blue-700" 
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Importing..." : "Import Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}