export interface Forum {
    forumId: string;
    postedBy: string;
    title: string;
    text: string;
    createdAt: Date;
    replies?: Array<{
        text: string;
        username: string;
        createdAt: Date;
    }>;
}
