import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Transaction } from "@/types/api";

const editTransactionSchema = z.object({
  amount: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.string(),
  date: z.string(),
  paymentMethod: z.string().optional(),
  intentTag: z.string().optional(),
  repeatPattern: z.string().optional(),
  isPlanned: z.boolean().optional()
});

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const formSchema = editTransactionSchema.extend({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number")
});

const getDefaultValues = () => ({
  amount: "",
  description: "",
  category: "Other",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "",
  intentTag: "Optional",
  repeatPattern: "none",
  isPlanned: false
});

export default function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
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
      paymentMethod: "",
      intentTag: "Optional",
      repeatPattern: "none",
      isPlanned: false
    }
  });

  React.useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount || "",
        description: transaction.description || "",
        category: transaction.category || "",
        type: transaction.type || "expense",
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || "",
        intentTag: transaction.intentTag || "Optional",
        repeatPattern: transaction.repeatPattern || "none",
        isPlanned: Boolean(transaction.isPlanned)
      });
    }

    if (!transaction) {
      form.reset(getDefaultValues());
      return;
    }

    form.reset({
      amount: transaction.amount || "",
      description: transaction.description || "",
      category: transaction.category || "Other",
      type: transaction.type || "expense",
      date: transaction.date || new Date().toISOString().split("T")[0],
      paymentMethod: transaction.paymentMethod || "",
      intentTag: transaction.intentTag || "Optional",
      repeatPattern: transaction.repeatPattern || "none",
      isPlanned: Boolean(transaction.isPlanned)
    });
  }, [isOpen, transaction, form]);

  const editTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!transaction) {
        throw new Error("No transaction selected");
      }
      return apiRequest("PUT", `/api/transactions/${transaction.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Transaction updated successfully"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    editTransactionMutation.mutate(data);
  };

  const intentTags = ["Necessary", "Optional", "Investment in self", "Emotional", "Convenience tax", "Regret spend"];

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                      {categories.map((category) => (
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
              name="intentTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intent Tag</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intentTags.map((intent) => (
                        <SelectItem key={intent} value={intent}>{intent}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Pattern</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Updating this only changes this entry; future generated entries can be edited separately.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intentTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intent Tag</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intentTags.map((intent) => (
                        <SelectItem key={intent} value={intent}>{intent}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Pattern</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Updating this only changes this entry; future generated entries can be edited separately.</FormDescription>
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
                disabled={editTransactionMutation.isPending || !transaction}
              >
                {editTransactionMutation.isPending ? "Updating..." : "Update Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
