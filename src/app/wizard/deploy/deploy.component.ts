import { Component, Input } from '@angular/core';

import { Gui, StatusMessage, StatusEvent } from '../../shared/model';
import { ForgeService } from "../../shared/forge.service";
import { KeycloakService } from "../../shared/keycloak.service";
import { Config } from "../../shared/config.component";

@Component({
  selector: 'deploy',
  templateUrl: './deploy.component.html'
})
export class DeployComponent {
  @Input() submittedGuis: Gui[];
  @Input() command: string;
  progress: boolean;
  statusMessages: StatusMessage[];

  private apiUrl: string = process.env.LAUNCHPAD_MISSIONCONTROL_URL;
  private webSocket: WebSocket;

  constructor(private forgeService: ForgeService,
    private kc: KeycloakService,
    private config: Config) {
      if (!this.apiUrl) {
        this.apiUrl = config.get('mission_control_url');
      }
      if (this.apiUrl && this.apiUrl[this.apiUrl.length - 1] != '/') {
        this.apiUrl += '/';
      }
  }

  deploy(): void {
    if (this.kc.isAuthenticated()) {
      this.progress = true;
      this.forgeService.upload(this.command, this.submittedGuis)
        .then(status => {
          this.webSocket = new WebSocket(this.apiUrl + status.uuid_link);
          this.webSocket.onmessage = function(event: MessageEvent) {
            if (!this.statusMessages) {
              this.statusMessages = [];
              let values = JSON.parse(event.data);
              for (let item of values) {
                for (let key in item) {
                  let status = new StatusMessage(key, item[key]);
                  this.statusMessages.push(status);
                }
              }
            } else {
              let message = JSON.parse(event.data);
              for (let status of this.statusMessages) {
                if (status.messageKey == message.statusMessage) {
                  status.done = true;
                  status.data = message.data;
                }
              }
            }
          }.bind(this);
        });
    } else {
      this.kc.login();
    }
  }

  get done(): boolean {
    if (!this.statusMessages) return false;
    for (let status of this.statusMessages) {
      if (!status.done) return false;
    }
    return true;
  }

  downloadZip(): void {
    this.forgeService.downloadZip(this.command, this.submittedGuis);
  }
}