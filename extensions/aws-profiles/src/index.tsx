import { ActionPanel, Detail, List, Action, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { exec }  from 'child_process'
import { promisify } from 'util';
import { homedir } from 'os';
import path = require('path');

const execp = promisify(exec);

export interface ExecResult {
    stdout: string;
    stderr: string;
}

interface Preference {
    command: string | null
}

function GetProfiles()
{
    const fs = require('fs');
    const ini = require('ini');
    const awsconfigfile = path.join(homedir(), '/.aws/config');
    const profiles = ini.parse(fs.readFileSync(awsconfigfile, 'utf-8'))

    return profiles
}

async function ExecCmd(cmd: string): Promise<ExecResult> {
    try {
      return await execp(cmd);
    } catch (err) {
        console.log(err)
        throw err;
    }

}

async function OpenAssumeConsole(profile: string) {
    const preference = getPreferenceValues<Preference>();
    const regex = /<profile>/i;

    var cmd: string| null = preference.command
    if (cmd != null)  {
        cmd = cmd.replace(regex, profile);
        ExecCmd(cmd)
    } else {
        showToast(Toast.Style.Failure, "Error: No command defined");
    }
}

function ProfileListItem(props: {title: string, accessories: List.Item.Accessory[], profile: string}) {
    return (
      <List.Item
        icon="list-icon.png"
        title={props.title}
        accessories={props.accessories}
        actions={
          <ActionPanel>
            {/* <Action.Push title="Show Details" target={} /> */}
            <Action title="" onAction={ () => { OpenAssumeConsole(props.profile) }} />
          </ActionPanel>
        }
      />
    )
}

export default function Command() {
    const list = [];
    let profiles = GetProfiles();

    for (const header in profiles) {
        if (header != 'default') {
            const prof = header.replace('profile ', '')
            const title=profiles[header].sso_account_name 
            const a: List.Item.Accessory[] = [
                {text: profiles[header].sso_account_id},
                {text: profiles[header].sso_role_name}
                ]
            list.push(<ProfileListItem key={prof} profile={prof} title={title} accessories={a}/>);
        }
    }

    return (<List>{list}</List>);
}
