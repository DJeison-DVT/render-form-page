"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EntrySchema, RenderUploadSchema, initializeEntry, initializeRenderUpload } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import ContactInformation from "@/app/components/formPage/ContactInformation";
import CompanySelection from "@/app/components/formPage/CompanySelection";
import EntryForm from "./components/formPage/EntryForm";

export default function Home() {
  const form = useForm<z.infer<typeof RenderUploadSchema>>({
    resolver: zodResolver(RenderUploadSchema),
    defaultValues: initializeRenderUpload(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  function onSubmit(values: z.infer<typeof RenderUploadSchema>) {
    console.log(values);
  }

  const slides = [
    { title: "Compañía", content: <CompanySelection form={form} /> },
    { title: "Información de contacto", content: <ContactInformation form={form} /> },
    ...fields.map((field, index) => ({
      title: `Entry ${index + 1}`,
      content: <EntryForm form={form} index={index} field={field} />,
    })),
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNextSlide = () => {

    if (!(currentSlide < slides.length - 1)) {
      append(initializeEntry());
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
            {currentSlide > 1 && (
              <button
                className="cursor-pointer bg-gray-800/90 mt-auto text-white rounded-full hover:bg-gray-700/90 transition h-fit p-4 flex justify-center items-center text-xl"
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
