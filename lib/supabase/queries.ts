import { createClient } from "@/lib/supabase/client"
import { validateTexts } from "@/lib/swear-filter"

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
    const supabase = createClient()
    return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, username: string) {
    const supabase = createClient()
    return supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
    })
}

export async function signOut() {
    const supabase = createClient()
    return supabase.auth.signOut()
}

export async function getUser() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user
}

// ─── ROLES & PERMISSIONS ──────────────────────────────────────────────────────

export type UserRole = "student" | "teacher" | "admin"

export async function getUserRole(): Promise<{ role: UserRole; subject: string | null } | null> {
    const user = await getUser()
    if (!user) return null
    const supabase = createClient()
    const { data } = await supabase
        .from("profiles")
        .select("role, subject")
        .eq("id", user.id)
        .maybeSingle()
    return data ? { role: (data.role || 'student') as UserRole, subject: data.subject } : null
}

/**
 * Check if the current user can edit/delete content.
 * Returns true if user is: the author, an admin, or a teacher with matching subject.
 */
export async function canEditContent(authorId: string, contentSubject?: string | null): Promise<boolean> {
    const user = await getUser()
    if (!user) return false
    if (user.id === authorId) return true

    const roleInfo = await getUserRole()
    if (!roleInfo) return false
    if (roleInfo.role === "admin") return true
    if (roleInfo.role === "teacher" && contentSubject && roleInfo.subject === contentSubject) return true

    return false
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

export type QuestionFilter = "recent" | "unanswered" | "top"

export async function getQuestions(filter: QuestionFilter = "recent") {
    const supabase = createClient()
    let query = supabase
        .from("questions")
        .select(`
      *,
      profiles ( username, avatar_url, badge, role )
    `)

    if (filter === "unanswered") {
        query = query.eq("answer_count", 0)
    } else if (filter === "top") {
        query = query.order("upvotes", { ascending: false })
    } else {
        query = query.order("created_at", { ascending: false })
    }

    return query.limit(20)
}

export async function getQuestionById(id: string) {
    const supabase = createClient()
    return supabase
        .from("questions")
        .select(`*, profiles ( username, avatar_url, badge, points, role, subject )`)
        .eq("id", id)
        .single()
}

export async function postQuestion(data: {
    title: string
    body: string
    grade?: string
    subject?: string
    unit?: string
    tags?: string[]
    youtube_url?: string
    pdf_url?: string
    image_url?: string
    is_off_topic?: boolean
}) {
    validateTexts(data.title, data.body)

    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    return supabase.from("questions").insert({
        ...data,
        author_id: user.id,
        grade: data.grade ? parseInt(data.grade) : null,
    })
}

export async function updateQuestion(id: string, data: {
    title?: string
    body?: string
    subject?: string
    grade?: string
    unit?: string
    tags?: string[]
}) {
    validateTexts(data.title, data.body)

    const supabase = createClient()
    const updateData: any = { ...data }
    if (data.grade) updateData.grade = parseInt(data.grade)

    return supabase.from("questions").update(updateData).eq("id", id)
}

export async function deleteQuestion(id: string) {
    const supabase = createClient()
    return supabase.from("questions").delete().eq("id", id)
}

export async function incrementViewCount(id: string) {
    const supabase = createClient()
    return supabase.rpc("increment_view_count", { question_id: id })
}

// ─── ANSWERS ──────────────────────────────────────────────────────────────────

export async function getAnswersByQuestionId(questionId: string) {
    const supabase = createClient()
    return supabase
        .from("answers")
        .select(`
      *,
      profiles ( username, avatar_url, badge, points, role ),
      answer_replies (
        *,
        profiles ( username, avatar_url, role )
      )
    `)
        .eq("question_id", questionId)
        .order("is_accepted", { ascending: false })
        .order("upvotes", { ascending: false })
}

export async function postAnswer(questionId: string, body: string) {
    validateTexts(body)

    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    const res = await supabase.from("answers").insert({
        question_id: questionId,
        author_id: user.id,
        body,
    })

    await awardPoints(user.id, 10)
    return res
}

export async function postReply(answerId: string, body: string) {
    validateTexts(body)

    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    const res = await supabase.from("answer_replies").insert({
        answer_id: answerId,
        author_id: user.id,
        body,
    })

    await awardPoints(user.id, 5)
    return res
}

export async function markAnswerAccepted(answerId: string) {
    const supabase = createClient()
    return supabase.from("answers").update({ is_accepted: true }).eq("id", answerId)
}

export async function deleteAnswer(id: string) {
    const supabase = createClient()
    return supabase.from("answers").delete().eq("id", id)
}

export async function deleteReply(id: string) {
    const supabase = createClient()
    return supabase.from("answer_replies").delete().eq("id", id)
}

// ─── NOTES ────────────────────────────────────────────────────────────────────

export async function getNotes(filter?: { grade?: string; subject?: string }) {
    const supabase = createClient()
    let query = supabase
        .from("notes")
        .select(`*, profiles ( username, avatar_url, badge, role )`)
        .order("created_at", { ascending: false })

    if (filter?.grade) query = query.eq("grade", parseInt(filter.grade))
    if (filter?.subject) query = query.eq("subject", filter.subject)

    return query.limit(20)
}

export async function getNoteById(id: string) {
    const supabase = createClient()
    return supabase
        .from("notes")
        .select(`*, profiles ( username, avatar_url, badge, points, role, subject )`)
        .eq("id", id)
        .single()
}

export async function getNoteByFilter(grade: string, subject: string) {
    const supabase = createClient()
    return supabase
        .from("notes")
        .select(`*, profiles ( username, avatar_url, badge, points, role )`)
        .eq("grade", parseInt(grade))
        .eq("subject", subject)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
}

export async function getCommentsByNoteId(noteId: string) {
    const supabase = createClient()
    return supabase
        .from("note_comments")
        .select(`*, profiles ( username, avatar_url, role )`)
        .eq("note_id", noteId)
        .order("created_at", { ascending: false })
}

export async function postNoteComment(noteId: string, content: string) {
    validateTexts(content)

    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    return supabase.from("note_comments").insert({
        note_id: noteId,
        author_id: user.id,
        content,
    })
}

export async function deleteNoteComment(id: string) {
    const supabase = createClient()
    return supabase.from("note_comments").delete().eq("id", id)
}

export async function postNote(data: {
    title: string
    description?: string
    grade?: string
    subject?: string
    unit?: string
    note_type?: string
    tags?: string[]
    youtube_url?: string
    file?: File | null
}) {
    validateTexts(data.title, data.description)

    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    let file_url: string | undefined

    // Upload file to Supabase Storage if present
    if (data.file) {
        const isImage = data.file.type.startsWith("image/")
        const bucket = isImage ? "images" : "notes"

        const ext = data.file.name.split(".").pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploaded, error } = await supabase.storage
            .from(bucket)
            .upload(path, data.file, { upsert: false })

        if (error) throw error

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(uploaded.path)
        file_url = pub.publicUrl
    }

    const res = await supabase.from("notes").insert({
        title: data.title,
        description: data.description,
        author_id: user.id,
        grade: data.grade ? parseInt(data.grade) : null,
        subject: data.subject,
        unit: data.unit,
        note_type: data.note_type,
        tags: data.tags ?? [],
        youtube_url: data.youtube_url ?? null,
        file_url: file_url ?? null,
    })

    // Award 20 points for sharing a note
    await awardPoints(user.id, 20)

    return res
}

export async function updateNote(id: string, data: {
    title?: string
    description?: string
    subject?: string
    grade?: string
    unit?: string
    tags?: string[]
}) {
    validateTexts(data.title, data.description)

    const supabase = createClient()
    const updateData: any = { ...data }
    if (data.grade) updateData.grade = parseInt(data.grade)

    return supabase.from("notes").update(updateData).eq("id", id)
}

export async function deleteNote(id: string) {
    const supabase = createClient()
    return supabase.from("notes").delete().eq("id", id)
}

export async function incrementNoteViewCount(noteId: string) {
    const supabase = createClient()
    return supabase.rpc("increment_note_view_count", { note_id: noteId })
}

// ─── VOTES ────────────────────────────────────────────────────────────────────

export async function vote(
    targetId: string,
    targetType: "question" | "answer" | "note",
    direction: "up" | "down"
) {
    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    // Upsert — if same direction, remove; otherwise switch
    const { data: existing } = await supabase
        .from("votes")
        .select("id, direction")
        .eq("user_id", user.id)
        .eq("target_id", targetId)
        .maybeSingle()

    if (existing) {
        if (existing.direction === direction) {
            // toggle off
            await supabase.from("votes").delete().eq("id", existing.id)
            return { action: "removed" as const }
        } else {
            // switch direction
            await supabase.from("votes").update({ direction }).eq("id", existing.id)
            return { action: "switched" as const }
        }
    } else {
        await supabase.from("votes").insert({
            user_id: user.id,
            target_id: targetId,
            target_type: targetType,
            direction,
        })
        return { action: "added" as const }
    }
}

/** Check if current user has voted on a target */
export async function getUserVote(targetId: string): Promise<"up" | "down" | null> {
    const supabase = createClient()
    const user = await getUser()
    if (!user) return null

    const { data } = await supabase
        .from("votes")
        .select("direction")
        .eq("user_id", user.id)
        .eq("target_id", targetId)
        .maybeSingle()

    return data?.direction as ("up" | "down" | null) ?? null
}

/** Get vote count for a target */
export async function getVoteCount(targetId: string): Promise<{ up: number; down: number }> {
    const supabase = createClient()
    const { count: up } = await supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("target_id", targetId)
        .eq("direction", "up")

    const { count: down } = await supabase
        .from("votes")
        .select("id", { count: "exact", head: true })
        .eq("target_id", targetId)
        .eq("direction", "down")

    return { up: up ?? 0, down: down ?? 0 }
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

export async function awardPoints(userId: string, pointsAmount: number) {
    const supabase = createClient()
    const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single()

    if (profile) {
        const newPoints = (profile.points || 0) + pointsAmount
        // Auto-assign badge based on point thresholds
        let badge: string | null = null
        if (newPoints >= 1000) badge = "Elmas"
        else if (newPoints >= 500) badge = "Altın"
        else if (newPoints >= 200) badge = "Gümüş"
        else if (newPoints >= 50) badge = "Bronz"
        else badge = "Yeni Üye"

        await supabase
            .from("profiles")
            .update({ points: newPoints, badge })
            .eq("id", userId)
    }
}

export async function getLeaderboard(sortBy: "points" | "notes" = "points", limit = 10) {
    const supabase = createClient()
    const query = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, points, badge, role")
        .eq("role", "student")
        .order(sortBy === "points" ? "points" : "points", { ascending: false })
        .limit(limit)
    return query
}

export async function getProfileStats(userId: string) {
    const supabase = createClient()
    // Total notes shared
    const { count: notesCount } = await supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId)

    // Total likes (from votes table — count upvotes on user's notes)
    const { data: userNotes } = await supabase
        .from("notes")
        .select("id")
        .eq("author_id", userId)

    let totalLikes = 0
    if (userNotes && userNotes.length > 0) {
        const noteIds = userNotes.map(n => n.id)
        const { count: likesCount } = await supabase
            .from("votes")
            .select("id", { count: "exact", head: true })
            .in("target_id", noteIds)
            .eq("direction", "up")
        totalLikes = likesCount ?? 0
    }

    // Total downloads
    const { data: dlData } = await supabase
        .from("notes")
        .select("downloads")
        .eq("author_id", userId)
    const totalDownloads = dlData?.reduce((sum, n) => sum + (n.downloads || 0), 0) ?? 0

    // Rank – count profiles with more points
    const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single()

    const { count: rankCount } = profile
        ? await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gt("points", profile.points)
        : { count: 0 }

    return {
        notesShared: notesCount ?? 0,
        totalLikes,
        totalDownloads,
        rank: (rankCount ?? 0) + 1,
    }
}

export async function getNotesByAuthor(userId: string) {
    const supabase = createClient()
    return supabase
        .from("notes")
        .select(`*, profiles ( username, avatar_url, badge, role )`)
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)
}

export async function searchAll(query: string) {
    const supabase = createClient()
    const q = `%${query}%`
    const [notesRes, questionsRes] = await Promise.all([
        supabase
            .from("notes")
            .select("id, title, subject, grade")
            .or(`title.ilike.${q},subject.ilike.${q}`)
            .limit(5),
        supabase
            .from("questions")
            .select("id, title, subject, grade")
            .or(`title.ilike.${q},subject.ilike.${q}`)
            .limit(5),
    ])
    const notes = (notesRes.data ?? []).map(n => ({
        id: n.id,
        title: n.title,
        subtitle: `${n.subject ?? ""} - ${n.grade ?? ""}. Sınıf`,
        link: `/notes/${n.id}`,
        type: "note" as const,
    }))
    const questions = (questionsRes.data ?? []).map(q2 => ({
        id: q2.id,
        title: q2.title,
        subtitle: `${q2.subject ?? ""} - ${q2.grade ?? ""}. Sınıf`,
        link: `/questions/${q2.id}`,
        type: "question" as const,
    }))
    return [...notes, ...questions]
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function getCurrentProfile() {
    const supabase = createClient()
    const user = await getUser()
    if (!user) return null
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    return data
}

export async function updateProfile(data: {
    username?: string
    full_name?: string
    avatar_url?: string
    bio?: string
    grade?: number
}) {
    const supabase = createClient()
    const user = await getUser()
    if (!user) throw new Error("Giriş yapmalısınız")

    return supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id)
}
