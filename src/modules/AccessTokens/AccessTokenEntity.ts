import MysqlAbstractEntity from "../../Global/MysqlAbstractEntity";
import {DatabaseAccessToken} from "../../Global/DatabaseType";
import moment, {Moment} from "moment";
import {TypeAccessTokenType} from "../../utils/Types";
import Utils from "../../utils/Utils";
import {GeneralErrors} from "../../Global/BackendErrors";

export default class AccessTokenEntity extends MysqlAbstractEntity<boolean> {
  public id: number;
  public userId: number;
  public startDate: Moment;
  public expirationDate: Moment;
  public token: string;
  public type: TypeAccessTokenType;

  constructor(
    id: number,
    userId: number,
    startDate: Moment,
    expirationDate: Moment,
    token: string,
    type: TypeAccessTokenType
  ) {
    super();
    this.id = id;
    this.userId = userId;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.token = token;
    this.type = type;
  }

  async save() {
    try {
      let responseData;
      if (!this.existsInDataBase) {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "INSERT INTO `access_tokens` (`user_id`, `start_date`, `expiration_date`, `token`, `type`) VALUES (:userId, :startDate, :expirationDate, :token, :type)",
            {
              userId: this.userId,
              startDate: this.startDate.format("YYYY-MM-DD HH:mm:ss"),
              expirationDate: this.expirationDate.format("YYYY-MM-DD HH:mm:ss"),
              token: this.token,
              type: this.type
            }
          )
        );

        this.id = responseData.insertId;
      } else {
        responseData = await Utils.executeMysqlRequest(
          Utils.getMysqlPool().execute(
            "UPDATE `access_tokens` SET `user_id`= :userId, `start_date`= :startDate, `expiration_date`= :expirationDate, `token`= :token, `type`= :type WHERE `id`= :id",
            {
              userId: this.userId,
              startDate: this.startDate.format("YYYY-MM-DD HH:mm:ss"),
              expirationDate: this.expirationDate.format("YYYY-MM-DD HH:mm:ss"),
              token: this.token,
              type: this.type,
              id: this.id
            }
          )
        );
      }
      if (responseData.affectedRows === 0) {
        return {
          success: false,
          error: {
            code: GeneralErrors.DATABASE_REQUEST_ERROR,
            message: "The access_token has not been persisted in the database"
          }
        };
      }
      return {
        success: true,
        data: {
          accessToken: this
        }
      };
    } catch (e) {
      Utils.manageError(e);
      return {
        success: false,
        error: {
          code: GeneralErrors.DATABASE_REQUEST_ERROR,
          message: "An error has occurred while saving data"
        }
      };
    }
  }

  static fromDatabaseObject(databaseObject: DatabaseAccessToken) {
    const accessTokenEntity = new AccessTokenEntity(
      databaseObject.id,
      databaseObject.user_id,
      moment(databaseObject.start_date),
      moment(databaseObject.expiration_date),
      databaseObject.token,
      databaseObject.type
    );

    accessTokenEntity.existsInDataBase = true;
    return accessTokenEntity;
  }

  toJSON(): Object {
    return {
      id: this.id,
      userId: this.userId,
      startDate: this.startDate,
      expirationDate: this.expirationDate,
      token: this.token,
      type: this.type
    };
  }
}
