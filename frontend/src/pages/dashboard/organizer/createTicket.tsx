import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, } from "lucide-react";
import { useEvent } from "../../../hooks/useEvents";
import { apiFetch } from "../../../utils/apiClient";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ticketSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  tickets: z.array(
    z.object({
      name: z.string().min(2, "Ticket name too short"),
      price: z.number().min(0, "Price cannot be negative"),
      quantity: z.number().int().min(1, "At least 1 ticket"),
      maxPerPerson: z.number().int().min(1).max(20).optional(),
      salesStart: z.string(),
      salesEnd: z.string(),
    })
  ),
});

type FormData = z.infer<typeof ticketSchema>;

export default function CreateTicket() {
  const { events, loading: eventsLoading } = useEvent(); // Your events
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
   const {eventId} = useParams()
   const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      tickets: [{ name: "Regular", price: 0, quantity: 100, maxPerPerson: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
       
      await apiFetch(`/api/events/${eventId}/tickets`, {
        method: "POST",
        body: JSON.stringify(data.tickets),
      });
      
      toast.success('Ticket created successfully')

      setSuccess(true);

      navigate('/dashboard/my-events')
     
    } catch (err) {
      alert("Failed to create tickets",);
      console.error('Ticket creation failed', err)
    } finally {
      setSubmitting(false);
    }
  };

  if (eventsLoading) return <div>Loading your events...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Tickets</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
          Tickets created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Event Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Event</label>
          <select
            {...register("eventId")}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
          {errors.eventId && (
            <p className="text-red-500 text-sm mt-1">{errors.eventId.message}</p>
          )}
        </div>

        {/* Ticket Types */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ticket Types</h2>
            <button
              type="button"
              onClick={() => append({ name: "", price: 0, quantity: 50 ,maxPerPerson: 10,salesStart:"",salesEnd: ""})}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={20} /> Add Ticket Type
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 p-6 rounded-xl space-y-4">
              <div className="flex justify-between">
                <h3 className="font-medium">Ticket #{index + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label>Ticket Name (e.g. VIP, Early Bird)</label>
                  <input
                    {...register(`tickets.${index}.name`)}
                    placeholder="VIP Access"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {errors.tickets?.[index]?.name && (
                    <p className="text-red-500 text-sm">
                      {errors.tickets[index].name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label>Price (GHS)</label>
                  <input
                    type="number"
                    {...register(`tickets.${index}.price`, { valueAsNumber: true })}
                    placeholder="150"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label>Total Quantity</label>
                  <input
                    type="number"
                    {...register(`tickets.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="100"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label>Max per Person (optional)</label>
                  <input
                    type="number"
                    {...register(`tickets.${index}.maxPerPerson`, { valueAsNumber: true })}
                    placeholder="10"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label>Sales Start</label>
                  <input
                    type="datetime-local"
                    {...register(`tickets.${index}.salesStart`)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label>Sales End</label>
                  <input
                    type="datetime-local"
                    {...register(`tickets.${index}.salesEnd`)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:opacity-70"
        >
          {submitting ? "Creating Tickets..." : "Create Tickets"}
        </button>
      </form>
    </div>
  );
}