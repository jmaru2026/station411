import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BtxNewsWebPartStrings';
import BtxNews from './components/BtxNews';
import { IBtxNewsProps } from './components/IBtxNewsProps';

export interface IBtxNewsWebPartProps {
  description: string;
  context:any;
  List:string;
  gmapToken:string;
  dynamicZoom:string;
  TollFree:string;
  MainLine:string;
  Fax:string;
  Email:string;
  StoreManager:string;
}

export default class BtxNewsWebPart extends BaseClientSideWebPart<IBtxNewsWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IBtxNewsProps> = React.createElement(
      BtxNews,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context:this.context,
        List:this.properties.List,
        gmapToken:this.properties.gmapToken,
        dynamicZoom:this.properties.dynamicZoom,
        TollFree:this.properties.TollFree,
        MainLine:this.properties.MainLine,
        Fax:this.properties.Fax,
        Email:this.properties.Email,
        StoreManager:this.properties.StoreManager
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('List', {
                  label: "List Title",
                  value:"Station 411"
                }),
                PropertyPaneTextField('dynamicZoom', {
                  label: "Dynamic Zoom Value",
                  value:"20"
                }),
                PropertyPaneTextField('gmapToken', {
                  label: "Google Map Token",
                  value:"AIzaSyAKEce6-O8Jh7zoS2a-o0AO5K8MJAt_zwE"
                }),
                PropertyPaneTextField('TollFree', {
                  label: "TollFree Title",
                  value:"Toll Free"
                }),
                PropertyPaneTextField('MainLine', {
                  label: "MainLine Title",
                  value:"Main Line"
                }),
                PropertyPaneTextField('Fax', {
                  label: "Fax Title",
                  value:"Fax"
                }),
                PropertyPaneTextField('Email', {
                  label: "Email Title",
                  value:"Email"
                }),
                PropertyPaneTextField('StoreManager', {
                  label: "Store Manager Title",
                  value:"Store Manager"
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
