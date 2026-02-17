import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

var _sp: SPFI | null = null;

export interface IStation {
  id: number;
  title: string;

  address: string;
  address2: string;

  tollFree: string;
  phone: string;
  fax: string;

  email: string;
  manager: string;

  lat: number;
  lng: number;

  image: string;
  link: string;
}

export const getSP = (context?: WebPartContext): SPFI => {
  if (context != null) {
    _sp = spfi().using(SPFx(context));
  }
  return _sp!;
};

// call spfx list 


export const getAllData = async (
  listId: string,
  context:any,
  titleFilter?: string
): Promise<IStation[]> => {

  try {

    const sp = getSP(context);

    let query = sp.web.lists
      .getByTitle(listId)
      .items
      .select(
        "Id",
        "Title",
        "address",
        "address2",
        "TollFree",
        "phone",
        "Fax",
        "email",
        "StoreManager",
        "lat",
        "lng",
        "Image",
        "StoreLink"
      )
      .top(5000);

    /* =========================
       Filter by title
    ========================= */

    if (titleFilter) {
      query = query.filter(`substringof('${titleFilter}', Title)`);
    }

    const items = await query();

    /* =========================
       Map to clean model
    ========================= */

    const stations: IStation[] = items.map((i: any) => ({

      id: i.Id,
      title: i.Title,

      address: i.address || "",
      address2: i.address2 || "",

      tollFree: i.TollFree || "",
      phone: i.phone || "",
      fax: i.Fax || "",

      email: i.email || "",
      manager: i.StoreManager || "",

      lat: Number(i.lat) || 0,
      lng: Number(i.lng) || 0,

      image: i.Image?.Url || i.Image || "",
      link: i?.StoreLink || ""
    }));

    return stations;

  } catch (error) {

    console.error("Error fetching stations:", error);
    return [];
  }
};

