import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  type: z.string(),
  date: z.string(),
  paymentMethod: z.string().optional(),
  intentTag: z.string().optional(),
  repeatPattern: z.string().optional(),
  contextTag: z.string().optional(),
  isPlanned: z.boolean().optional()
});

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      category: "Other",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      intentTag: "Optional",
      repeatPattern: "none",
      contextTag: "",
      isPlanned: false
    }
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Success", description: "Transaction added successfully" });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to add transaction: ${error.message}`, variant: "destructive" });
    }
  });

  const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];
  const intentTags = ["Necessary", "Optional", "Investment in self", "Emotional", "Convenience tax", "Regret spend"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add Smart Transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => addTransactionMutation.mutate(data))} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl><Input {...field} type="number" step="0.01" placeholder="0.00" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} placeholder="Salary, Rent, Café, EMI..." /></FormControl>
                <FormDescription>Used for smart category + recurring detection.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category (optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "Other"}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
                <FormDescription>Leave as Other to let app auto-categorize.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="intentTag" render={({ field }) => (
              <FormItem>
                <FormLabel>Intent Tag</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>{intentTags.map((intent) => <SelectItem key={intent} value={intent}>{intent}</SelectItem>)}</SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="repeatPattern" render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Pattern</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Salary/EMI/Rent/Subscription entries auto-generate future transactions.</FormDescription>
              </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input {...field} type="date" /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="paymentMethod" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl><Input {...field} placeholder="Credit Card, Cash..." /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="isPlanned" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Was this planned?</FormLabel>
                </div>
              </FormItem>
            )} />

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-finance-blue hover:bg-blue-700" disabled={addTransactionMutation.isPending}>
                {addTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
