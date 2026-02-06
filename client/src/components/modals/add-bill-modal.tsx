import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid", "overdue"]),
  isRecurring: z.boolean(),
  autoPayEnabled: z.boolean(),
  icon: z.string().optional(),
  color: z.string().optional()
});

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBillModal({ isOpen, onClose }: AddBillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof billSchema>>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      dueDate: new Date().toISOString().split('T')[0],
      status: "pending",
      isRecurring: false,
      autoPayEnabled: false,
      icon: "",
      color: ""
    }
  });

  const addBillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof billSchema>) => {
      console.log("Submitting bill data:", data);
      const response = await apiRequest("POST", "/api/bills", data);
      console.log("Bill submission response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Bill added successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill added successfully"
      });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to add bill:", error);
      toast({
        title: "Error",
        description: `Failed to add bill: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof billSchema>) => {
    // Set default icon and color based on category
    const categoryDefaults = {
      "electricity": { icon: "⚡", color: "#FCD34D" },
      "water": { icon: "💧", color: "#3B82F6" },
      "internet": { icon: "📶", color: "#8B5CF6" },
      "car": { icon: "🚗", color: "#EF4444" },
      "phone": { icon: "📱", color: "#10B981" },
      "insurance": { icon: "🛡️", color: "#F59E0B" },
      "subscription": { icon: "📺", color: "#6366F1" },
      "other": { icon: "📄", color: "#6B7280" }
    };

    const defaults = categoryDefaults[data.category as keyof typeof categoryDefaults] || categoryDefaults.other;
    
    addBillMutation.mutate({
      ...data,
      icon: data.icon || defaults.icon,
      color: data.color || defaults.color
    });
  };

  const categories = [
    { value: "electricity", label: "Electricity" },
    { value: "water", label: "Water & Sewer" },
    { value: "internet", label: "Internet & Cable" },
    { value: "car", label: "Car Payment" },
    { value: "phone", label: "Phone" },
    { value: "insurance", label: "Insurance" },
    { value: "subscription", label: "Subscription" },
    { value: "other", label: "Other" }
  ];

  const isRecurring = watch("isRecurring");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Bill Name</Label>
            <Input
              id="name"
              placeholder="e.g., Electric Company"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                {...register("amount")}
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              className={errors.dueDate ? "border-red-500" : ""}
            />
            {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue("status", value as "pending" | "paid" | "overdue")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="isRecurring"
              onCheckedChange={(checked) => setValue("isRecurring", checked)}
            />
            <Label htmlFor="isRecurring">Recurring bill</Label>
          </div>

          {isRecurring && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoPayEnabled"
                onCheckedChange={(checked) => setValue("autoPayEnabled", checked)}
              />
              <Label htmlFor="autoPayEnabled">Auto-pay enabled</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addBillMutation.isPending}
              className="bg-finance-blue hover:bg-blue-700"
            >
              {addBillMutation.isPending ? "Adding..." : "Add Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}