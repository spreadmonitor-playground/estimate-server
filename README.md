# Estimate Server

A socket-based, in-memory server for the [Estimate App][estimate-app-repository].

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## API

An API consumer can listen to various channels. Most of the channels are context dependent and will return
information relevant for the consumer.

### List Groups - `getGroups`

Returns an array of `Group`s.

_Channel direction:_ server -> client

Example response:

```ts
{
  groups: [
    {
      id: 'GROUP-4377761e-f695-4154-80dc-7dc9c2bf5820',
      members: [{ id: '03463d15-3c7d-4b32-8db3-a00cee6f0b7a', name: 'Anonymous' }],
      estimations: [{ complexity: 5, effort: 7, userId: '03463d15-3c7d-4b32-8db3-a00cee6f0b7a' }],
    },
  ];
}
```

### Create Group - `createGroup`

_Channel direction:_ client -> server

Creates a new `Group` and automatically enters it.

Example request: _none_

### Enter Group - `enterGroup`

_Channel direction:_ client -> server

Tries to enter a `Group` with the specified `groupId`.

Example request:

```ts
{
  groupId: 'GROUP-da0e03e0-cbd3-403f-8423-d707606a8027';
}
```

### Create Group - `leaveGroup`

_Channel direction:_ client -> server

Removes the user from all group.

Example request: _none_

### Estimations - `sendEstimation`

_Channel direction:_ client -> server

Sends an estimation to the currently entered group.

Example request:

```ts
{ complexity: 5, effort: 5, userId: "03463d15-3c7d-4b32-8db3-a00cee6f0b7a" }
```

### Estimations - `getEstimations`

_Channel direction:_ server -> client

Broadcasts all the estimations for the group the user is in.

Example response:

```ts
[
  { complexity: 5, effort: 3, userId: '03463d15-3c7d-4b32-8db3-a00cee6f0b7a' },
  { complexity: 3, effort: 2, userId: 'a201ffa0-16ac-47f8-8b92-a399592310fa' },
];
```

[estimator-app-repository]: https://github.com/spreadmonitor-playground/estimate-app

## License

[MIT](./LICENSE)

[estimate-app-repository]: https://github.com/spreadmonitor-playground/estimate-app
