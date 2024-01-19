# jira-standup aka Smartie

## Setup
1. Clone repo
2. Run `npm install`
3. Run `npm run build`
4. Load unpacked extension from `extension` folder

## Usage
1. Create a JSON file such as `attendees.json` for each team member in the format:
```
[{
    "id": "<JIRA_ID>",
    "name": "<NAME>",
    "avatarUrl": "<URL_FOR_IMAGE>"
}]
```
2. Steps for finding team member information for the above JSON:
   - Go to <https://{SUBDOMAIN}.atlassian.net/jira/people/search> and enter your team member's name
   - Select your team member from the search results
   - Copy the Jira ID from the URL which will be in the form of <https://{SUBDOMAIN}.atlassian.net/jira/people/{JIRA_ID}>
   - There should also be an image for the team member on the page, so:
     - Right-click the image and inspect the HTML source looking for an `img` tag with a `src` value which is the URL we will use for the `avatarUrl`
     - Note: If the URL ends in `/128`, update it to `/48` so it will use the smaller version of the image
3. Go to your team's Jira Board
4. Click the Chrome Extension in your browser and in the popup click the "Enabled" checkbox
5. Click the "Import" button and select the JSON file you created above
6. You should now see your team members listed in your Jira board and be able to select them to filter the board down to their work. Right-clicking a team member will change their background color indicating they have a linger to come back to at the end of all team member statuses