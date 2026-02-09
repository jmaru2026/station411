import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

var _sp: SPFI | null = null;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context != null) {
    _sp = spfi().using(SPFx(context));
  }
  return _sp!;
};

// call spfx list 


// Function to fetch latest 4 news from SharePoint using PnP SP
export const getAllData = async (listId:string): Promise<any[]> => {
  try {
    const sp = getSP();

    const items = await sp.web.lists
      .getById(listId)
      .items
      .select("*")
      .top(5000)();

    return items;
  } catch (error) {
    console.error("Error in fetchLatestNews:", error);
    return [];
  }
};

