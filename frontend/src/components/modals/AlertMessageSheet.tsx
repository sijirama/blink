import { useInterface } from "@/store/interface"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { socket } from "@/lib/socket"
import { MessageCircle, Send, X, Clock, User } from "lucide-react"
import axios from "axios"
import { Comment } from "@/types/comment"

export default function AlertMessageSheet() {
    const { type, data, onClose, isOpen } = useInterface()
    const open = isOpen && type === "alertComments"
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alertId } = data

    useEffect(() => {
        if (open && socket.connected) {
            // Initial fetch of comments
            fetchComments()

            // Set up socket listener for new comments
            socket.on(`comments-${alertId}`, (comment) => {
                setComments(prev => [...prev, comment])
            })
        }

        return () => {
            if (socket.connected) {
                socket.off(`comments-${alertId}`)
            }
        }
    }, [open, alertId])

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/comment/${alertId}`)
            setComments(response.data)
        } catch (error) {
            console.error("Failed to fetch comments:", error)
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await axios.post(`/api/comment/${alertId}`, {
                content: newComment.trim()
            })
            setNewComment("")
        } catch (error) {
            console.error("Failed to post comment:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateString: any) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] h-full flex flex-col">
                <SheetHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-blue-500" />
                            <SheetTitle>Alert Comments for {alertId}</SheetTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors hidden"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.ID}
                            className="bg-gray-50 rounded-lg p-4 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-sm">
                                        User {comment.UserID}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">
                                        {formatDate(comment.CreatedAt)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm">
                                {comment.Content}
                            </p>
                        </div>
                    ))}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="border-t pt-4 mt-auto"
                >
                    <div className="flex gap-2">
                        <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type your comment..."
                            className="flex-1"
                            disabled={isSubmitting}
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Send
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
