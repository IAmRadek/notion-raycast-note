import {Action, ActionPanel, Form, getPreferenceValues, Icon, showToast, Toast} from "@raycast/api";
import {Client} from "@notionhq/client";

interface Preferences {
  Token: string;
  DatabaseID: string;
}

type Values = {
  title: string;
  body: string;
};

interface Input {
  title: string;
}

export default function Command(props: { arguments: Input }) {
  const {title} = props.arguments;
  return (
    <Form
      actions={
        <ActionPanel>
          <ShareSecretAction/>
        </ActionPanel>
      }
    >
      <Form.Description text="Make quick Note to Notion"/>
      <Form.TextField id="title" title="Note title" placeholder="Enter text" defaultValue={title}/>
      <Form.TextArea id="body" title="Note text" autoFocus={true} placeholder="Enter description"/>
    </Form>
  );
}

function ShareSecretAction() {
  async function handleSubmit(values: Values) {
    const {title, body} = values;
    if (title === "" || body === "") {
      await showToast({style: Toast.Style.Failure, title: "Title or body is empty"});
      return;
    }

    await showToast(Toast.Style.Animated, "Creating note...");

    const preferences = getPreferenceValues<Preferences>();

    const client = new Client({auth: preferences.Token});
    const response = client.pages.create({
        parent: {database_id: preferences.DatabaseID,},
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                }
              }
            ]
          },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: body,
                  }
                }
              ]
            }
          }
        ]
      }
    );
    response.then(() => {
      showToast({style: Toast.Style.Success, title: "Note created"});
    }).catch((reason) => {

      showToast({style: Toast.Style.Failure, title: "Note creation failed " + reason});
    })
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Share Secret" onSubmit={handleSubmit}/>;
}