import { EditPermission } from "./value-object/edit-permission";
import { LayoutType } from "./value-object/layout-type";
import { ShareSetting } from "./value-object/share-setting";

/**
 * マップの設定。
 * Workspace のデフォルトを「上書きする」のはアプリケーション層で解釈する。
 * ドメインでは「このマップの設定」だけを持つ。
 * 将来: theme, defaultNodeType などを追加しても破綻しないよう、必要なら Partial やオプション拡張を検討。
 */
export interface MapSettings {
  layoutType: LayoutType;
  shareSetting: ShareSetting;
  editPermission: EditPermission;
}

/** createMap で settings 未指定時に使うデフォルト値。 */
export const defaultMapSettings: MapSettings = {
  layoutType: "left-to-right",
  shareSetting: "private",
  editPermission: "view",
};
