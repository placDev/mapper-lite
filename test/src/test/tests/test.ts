import { BaseMapperProfile } from '../../../../source/src/profile/base-mapper-profile';
import { MapperSettings } from '../../../../source/src/settings/mapper-settings';
import { ProfileMapperInterface } from '../../../../source/src/mapper/interfaces/profile-mapper.interface';

class User {
  constructor(toot: string, cit: number) {}

  giga: number;
  text: string = '123';
  large: UserDto = {} as UserDto;
  method() {}
}

class UserDto {
  giga: number;
  text3: string = '123';
  large: User = {} as User;
}
////////////

export class UserProfile extends BaseMapperProfile {
  async define(mapper: ProfileMapperInterface) {
    mapper
      .addRule(UserDto, User)
      .setToken('123')
      .callConstructor(User, (call) => {
        call('', 123);
      })
      .properties((x) => [x.giga])
      .complex(
        (x) => x.large,
        (x) => x.large,
      );

    mapper
      .addRule(User, UserDto)
      .property(
        (x) => x.text,
        (c) => c.text3,
      )
      .property(
        (x) => x.text,
        (c) => c.text3,
        async (value) => {
          return '';
        },
      )
      .complex(
        (x) => x.large,
        (c) => c.large,
        (gavno) => {
          return new User();
        },
      )
      .byRule(
        (x) => x.large,
        (c) => c.large,
        mapper.withRule(UserDto, User),
      )
      .validate();
  }
}

MapperSettings.addProfile(UserProfile);
MapperSettings.collectProfiles();

const mapper = MapperSettings.getMapper();

const dfg = [new User()];
const f = mapper.map(dfg, User, UserDto);
