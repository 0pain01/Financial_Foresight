import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const insertTransactionSchema = z.object({
  amount: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.string(),
  date: z.string(),
  paymentMethod: z.string().optional()
});

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number")
});

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "",
      type: "expense",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: ""
    }
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log("Submitting transaction data:", data);
      const response = await apiRequest("POST", "/api/transactions", data);
      console.log("Transaction submission response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Transaction added successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Transaction added successfully"
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to add transaction:", error);
      toast({
        title: "Error",
        description: `Failed to add transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addTransactionMutation.mutate(data);
  };

  const categories = [
    "Food & Dining",
    "Transportation", 
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Housing",
    "Income",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter transaction description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
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
            
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-finance-blue hover:bg-blue-700" 
                disabled={addTransactionMutation.isPending}
              >
                {addTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}