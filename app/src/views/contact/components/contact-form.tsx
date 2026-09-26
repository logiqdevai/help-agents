"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Textarea } from "@/components/ui/textarea";
import { ContactRequestTypeFormOptions } from "@/config/constants/dropdowns/contact/contact-request-type-form.options";
import { useSendContactRequest } from "@/features/contact/hooks/use-contact";
import { ContactRequestTypes } from "@/features/contact/interfaces/contact.interfaces";
import { contactSchema, type ContactFormData } from "@/features/contact/validation-schemas/contact.schema";
import { ContactSuccess } from "./contact-success";
import { ProductPicker } from "./product-picker";

const Optional: FC = () => <span className="font-normal text-muted-foreground">Optional</span>;

export const ContactForm: FC = () => {
  const sendRequest = useSendContactRequest();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      request_type: ContactRequestTypes.demo,
      name: "",
      email: "",
      phone: "",
      products: [],
      message: "",
      website: "",
    },
  });

  const onSubmit = (values: ContactFormData) => {
    sendRequest.mutate({
      request_type: values.request_type,
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      products: values.products,
      message: values.message || undefined,
      website: values.website || undefined,
    });
  };

  if (sendRequest.isSuccess) {
    return <ContactSuccess email={form.getValues("email")} />;
  }

  return (
    <div className="rounded-2xl border border-hairline bg-canvas p-6 sm:p-8">
      <Form {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="request_type"
            render={({ field }) => (
              <FormItem>
                <SegmentedControl
                  aria-label="Type of request"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={ContactRequestTypeFormOptions}
                />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Maria Papadopoulou" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <Optional />
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" placeholder="+30 21 0000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="products"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Which agents do you want to hear about?</FormLabel>
                <ProductPicker value={field.value} onChange={field.onChange} invalid={Boolean(fieldState.error)} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What would you like to automate? <Optional />
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="For example: following up with new leads by phone and booking viewings."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Honeypot: hidden from people, filled in by bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
            </label>
          </div>

          <ActionButtonWithPending type="submit" size="lg" className="h-10 w-full sm:w-fit sm:px-6" isPending={sendRequest.isPending}>
            Send request
          </ActionButtonWithPending>
        </form>
      </Form>
    </div>
  );
};
