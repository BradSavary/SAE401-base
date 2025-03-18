import { fakeNetwork } from "./utils";

interface TeamData {
    [key: string]: any;
}

interface HomePostData{
    [key: string]: any;
}

export async function fetchOurTeams(teamName: string): Promise<any> {
    await fakeNetwork();
    let answer = await fetch('/src/lib/data/teams-data.json');
    let data: TeamData = await answer.json();
    return data[teamName];
}

export async function fetchHomePosts(): Promise<any> {
    let answer = await fetch('http://localhost:8080/posts');
    let data: HomePostData = await answer.json();
    return data;
}