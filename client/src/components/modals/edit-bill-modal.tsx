import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const editBillSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  paymentMethod: z.string().optional(),
  isRecurring: z.boolean().optional(),
  autoPayEnabled: z.boolean().optional()
});

interface EditBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: any;
}

export default function EditBillModal({ isOpen, onClose, bill }: EditBillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof editBillSchema>>({
    resolver: zodResolver(editBillSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      dueDate: new Date().toISOString().split('T')[0],
      status: "pending",
      paymentMethod: "",
      isRecurring: false,
      autoPayEnabled: false
    }
  });

  // Update form values when bill prop changes
  React.useEffect(() => {
    if (bill) {
      console.log("Updating form with bill data:", bill);
      form.reset({
        name: bill.name || "",
        amount: bill.amount || "",
        category: bill.category || "",
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: bill.status || "pending",
        paymentMethod: bill.paymentMethod || "",
        isRecurring: bill.isRecurring || false,
        autoPayEnabled: bill.autoPayEnabled || false
      });
    }
  }, [bill, form]);

  const editBillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editBillSchema>) => {
      return apiRequest("PUT", `/api/bills/${bill.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Bill updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update bill: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof editBillSchema>) => {
    editBillMutation.mutate(data);
  };

  const categories = [
    "Electricity",
    "Water",
    "Gas",
    "Internet",
    "Phone",
    "Rent",
    "Insurance",
    "Credit Card",
    "Loan",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Bill</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter bill name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Credit Card, Debit Card, Cash, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Bill</FormLabel>
                    <div className="text-sm text-gray-500">
                      This bill repeats automatically
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoPayEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-Pay Enabled</FormLabel>
                    <div className="text-sm text-gray-500">
                      Automatically pay this bill when due
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-finance-blue hover:bg-blue-700" 
                disabled={editBillMutation.isPending}
              >
                {editBillMutation.isPending ? "Updating..." : "Update Bill"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}