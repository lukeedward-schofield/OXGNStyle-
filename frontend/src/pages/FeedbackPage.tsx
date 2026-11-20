import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { sendFeedback } from '../api/feedback'

export default function FeedbackPage() {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const mutation = useMutation({ mutationFn: sendFeedback })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (rating === null) {
      setFormError('Please pick a rating from 1 to 5.')
      return
    }

    try {
      await mutation.mutateAsync({
        rating,
        comment: comment.trim() || undefined,
        page: 'feedback',
      })
      setSent(true)
      setRating(null)
      setComment('')
    } catch {
      setFormError('Could not send your feedback. Please try again.')
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Tell us how OXGN Style+ worked for you. This is a prototype, so your feedback helps.
        </p>
      </div>

      {sent && (
        <p className="rounded-md border border-green-900 bg-green-950 p-3 text-sm text-green-300">
          Thank you! Your feedback was sent.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm text-neutral-300">How would you rate it? (1 = poor, 5 = great)</legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setRating(n)
                  setSent(false)
                }}
                aria-pressed={rating === n}
                className={`h-10 w-10 rounded-full border text-sm ${
                  rating === n
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm text-neutral-300">Comment (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              setSent(false)
            }}
            maxLength={1000}
            rows={4}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-white"
          />
          <span className="mt-1 block text-right text-xs text-neutral-500">{comment.length}/1000</span>
        </label>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
        >
          {mutation.isPending ? 'Sending…' : 'Send feedback'}
        </button>
      </form>
    </div>
  )
}