//const style = 'open-peeps';
//const style = "lorelei"
const style = "adventurer-neutral"

export function avatarImageUrl(profile: any): string {
    return `https://api.dicebear.com/8.x/${style}/png?seed=${profile.username || profile.Username || profile.email}`;
}
