import fetch from 'isomorphic-fetch';

const SYNC_API_URL = 'https://todoist.com/API/v8/sync';

export default class Todoist {
    static getUser(apiToken) {
        if (apiToken.length < 40) {
            console.warn(`API Token: '${apiToken}' looks too short...`);
        }

        return fetch(`${SYNC_API_URL}?token=${apiToken}&resource_types=["user"]`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    console.warn('response was not HTTP/200 when checking API token. response:', res);
                    return Promise.resolve({ error: 'could not get user' });
                }
            })
            .catch(err => {
                console.error('error getting user:', err);
            });
    }

    static getAvatarUrl = (image_id, size = 'medium') => {
        return `https://dcff1xvirvpfp.cloudfront.net/${image_id}_${size}.jpg`;
    };

    static fetch(apiToken) {
        return fetch(
            `${SYNC_API_URL}?token=${apiToken}&sync_token=*&resource_types=["labels","items","projects","collaborators"]`
        )
            .then(res => res.json())
            .then(todoistData => {
                // Labels
                let labels = todoistData['labels'];
                labels.sort((l1, l2) => l1.item_order - l2.item_order);
                labels.forEach(label => {
                    label.name = label.name.replaceAll('_', ' ').trim();
                });

                labels = labels.filter(label => label.is_deleted === 0);

                // Items
                const items = todoistData['items'];

                // Projects
                const projects = todoistData['projects'];
                projects.sort((p1, p2) => p1.item_order - p2.item_order);

                // Colaborators
                const collaborators = todoistData['collaborators'];

                return { labels, items, projects, collaborators };
            });
    }

    static fetchProjects(apiToken) {
        return fetch(
            `${SYNC_API_URL}?token=${apiToken}&sync_token=*&resource_types=["projects"]`
        )
            .then(res => res.json())
            .then(todoistData => {
                // Projects
                const projects = todoistData['projects'];
                projects.sort((p1, p2) => p1.item_order - p2.item_order);

                return { projects };
            });
    }

    static fetchTasks(apiToken) {
        return fetch(
            `${SYNC_API_URL}?token=${apiToken}&sync_token=*&resource_types=["items"]`
        )
            .then(res => res.json())
            .then(todoistData => {
                // Tasks
                const tasks = todoistData['items'];
                tasks.sort((p1, p2) => p1.item_order - p2.item_order);

                return { tasks };
            });
    }

    static fetchLabels(apiToken) {
        return fetch(
            `${SYNC_API_URL}?token=${apiToken}&sync_token=*&resource_types=["labels"]`
        )
            .then(res => res.json())
            .then(todoistData => {
                // Labels
                const labels = todoistData['labels'];
                labels.sort((p1, p2) => p1.item_order - p2.item_order);

                return { labels };
            });
    }

    static fetchNotes(apiToken) {
        return fetch(
            `${SYNC_API_URL}?token=${apiToken}&sync_token=*&resource_types=["notes"]`
        )
            .then(res => res.json())
            .then(todoistData => {
                // Notes
                const notes = todoistData['notes'];
                notes.sort((p1, p2) => p1.item_order - p2.item_order);

                return { notes };
            });
    }

}
