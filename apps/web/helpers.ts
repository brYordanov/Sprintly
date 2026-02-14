export const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.toUpperCase().slice(0, 2)
}
