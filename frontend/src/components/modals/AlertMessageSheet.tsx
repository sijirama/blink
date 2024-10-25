import { useInterface } from "@/store/interface"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { socket } from "@/lib/socket"
import { Send, X } from "lucide-react"
import axios from "axios"
import { Comment } from "@/types/comment"
import { avatarImageUrl } from "@/lib/avatar"

export default function AlertMessageSheet() {
    const { type, data, onClose, isOpen } = useInterface()
    const open = isOpen && type === "alertComments"
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alertId } = data

    const chatEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Initial fetch of comments
        fetchComments()


        // Emit event to join the comment room
        // socket.emit('join_comment_room', alertId, (response: any) => {
        //     if (response?.error) {
        //         console.error(`Failed to join room ${alertId}:`, response.error);
        //     }
        // });
        //
        // socket.on('joined_comment_room', (data) => {
        //     console.log(`Successfully fucking joined ${data.room}`);
        // });

        socket.on(`comments-${alertId}`, (comment) => {
            console.log("WE GOT THIS SHIT NOW: ", comment)
            setComments(prev => [...prev, comment])
            if (comment.error) {
                console.error("Failed to add comment:", comment.error)
                setIsSubmitting(false)
            }
        })

        if (open) {
        }

        return () => {
            socket.off(`comments-${alertId}`)
        }
    }, [open, alertId])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [comments])

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
                            <SheetTitle>Comments</SheetTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors hidden"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 hide-scrollbar">
                    {comments.map((comment) => (
                        <div
                            key={comment.ID}
                            className="bg-gray-100 rounded-lg p-4 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {
                                        comment.User && (
                                            <div
                                                className={`cursor-pointer rounded-full w-7 h-7 bg-center bg-cover bg-no-repeat`}
                                                style={{
                                                    backgroundImage: `url(${avatarImageUrl(comment?.User)})`,
                                                }}
                                                aria-label="User menu"
                                            />
                                        )
                                    }
                                    <span className="font-base text-sm">
                                        {(comment as any).User.Username}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
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
                    {/* Empty div to scroll to */}
                    <div ref={chatEndRef}></div>
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
