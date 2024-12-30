"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EntrySchema, RenderUploadSchema } from "@/app/Schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type RenderUpload = {
  approval_contact: string;
  request_contact: string;
  date: string;
  entries: Entry[];
};

type Entry = {
  // image: File | null;
  name: string;
  sizes: string;
  concept: string;
  unitary_price?: number;
  range?: string;
};

function RenderForm({
  form,
}: {
  form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="approval_contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Approval Contact</FormLabel>
            <FormControl>
              <Input placeholder="Approval Contact" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="request_contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Request Contact</FormLabel>
            <FormControl>
              <Input placeholder="Request Contact" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

function EntryForm({
  field,
  form,
  index,
}: {
  field: any;
  form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
  index: number;
}) {
  return (
    <div key={field.id} className="mb-4 p-4 border rounded">
      <h4 className="mb-2">Entry {index + 1}</h4>
      {/* <FormField
        control={form.control}
        name={`entries.${index}.image`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
              <input
                type="file"
                onChange={(e) => field.onChange(e.target.files?.[0])}
                className="border p-2 rounded"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      /> */}
      <FormField
        control={form.control}
        name={`entries.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.sizes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sizes</FormLabel>
            <FormControl>
              <Input placeholder="Sizes" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.concept`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>concept</FormLabel>
            <FormControl>
              <Input placeholder="Concepto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.unitary_price`}
        render={({ field: { value, onChange } }) => (
          <FormItem>
            <FormLabel>Unitary Price (Optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={value}
                placeholder="Unitary Price"
                onChange={(e) =>
                  onChange(Number(e.target.value))
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.range`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Range (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Range" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function Home() {
  const form = useForm<z.infer<typeof RenderUploadSchema>>({
    resolver: zodResolver(RenderUploadSchema),
    defaultValues: {
      approval_contact: "",
      request_contact: "",
      date: new Date().toISOString().split("T")[0],
      entries: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  function onSubmit(values: z.infer<typeof RenderUploadSchema>) {
    console.log(values);
  }

  const slides = [
    { title: "Registration Info", content: <RenderForm form={form} /> },
    ...fields.map((field, index) => ({
      title: `Entry ${index + 1}`,
      content: <EntryForm form={form} index={index} field={field} />,
    })),
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNextSlide = () => {

    if (!(currentSlide < slides.length - 1)) {
      append({ name: "", sizes: "", concept: "", unitary_price: 0, range: "" });
    }
    setCurrentSlide(currentSlide + 1);

  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="h-screen flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
            <div>{slides[currentSlide].content}</div>
          </div>
          <div className="absolute bottom-12 right-12 flex justify-end gap-4">
            {currentSlide > 0 && (
              <button
                className="cursor-pointer bg-gray-800/90 mt-auto text-white rounded-full hover:bg-gray-700/90 transition h-fit p-3 flex justify-center items-center text-xl"
              >
                Subir
              </button>
            )}

            <div className="flex flex-col space-y-2 gap-4">
              <div
                onClick={handlePreviousSlide}
                className="cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl"
              >
                &uarr;
              </div>

              <div
                onClick={handleNextSlide}
                className="cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl"
              >
                &darr;
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
