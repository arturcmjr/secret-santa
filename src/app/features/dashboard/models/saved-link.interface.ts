export enum SavedLinkType {
  Reveal = 'reveal',
  Manage = 'manage',
}

interface ISavedLinkBase {
  // secret santa id for management links, participant id for reveal links
  id: string;
  name: string;
  // local calendar day of the event, formatted as YYYY-MM-DD
  eventDate: string;
  // app-relative path, so no origin is persisted
  path: string;
  savedAt: number;
}

export interface IRevealLink extends ISavedLinkBase {
  type: SavedLinkType.Reveal;
  participantName: string;
}

export interface IManageLink extends ISavedLinkBase {
  type: SavedLinkType.Manage;
}

export type SavedLink = IRevealLink | IManageLink;
