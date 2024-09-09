export const data = {
  type: 'object',
  properties: {
    code: { type: 'number' },
    result: {
      type: 'object',
      description: '结果集',
      default: {},
      examples: ['anything', 4035],
      properties: {
        city: {
          type: 'object',
          properties: {
            Country: { type: 'string' },
            Province: { type: 'string' },
            City: { type: 'string' },
            Carrier: { type: 'string' },
            UserIp: { type: 'string' },
            city_sub_add_array: { type: 'array', items: { type: 'string' } },
            city_sub_add_object: {
              type: 'object',
              properties: {
                item111: { type: 'string' },
                item222: { type: 'string' }
              },
              required: []
            }
          }
        },
        condition: {
          type: 'object',
          properties: {
            day_weather: { type: 'string' },
            day_weather_short: { type: 'string' },
            day_wind_direction: { type: 'string' },
            day_wind_power: { type: 'string' },
            max_degree: { type: 'string' },
            min_degree: { type: 'string' },
            night_weather: { type: 'string' },
            night_weather_short: { type: 'string' },
            night_wind_direction: { type: 'string' },
            night_wind_power: { type: 'string' },
            aqi: {
              type: 'object',
              properties: {
                aqi: { type: 'number' },
                aqi_level: { type: 'number' },
                aqi_name: { type: 'string' },
                co: { type: 'string' },
                no2: { type: 'string' },
                o3: { type: 'string' },
                pm10: { type: 'string' },
                so2: { type: 'string' },
                update_time: { type: 'string' },
                pm2_5: { type: 'string' },
                api_sub_test: { type: 'string' }
              },
              required: []
            }
          }
        },
        forecast: { type: 'array', items: { type: 'string' } },
        result_sub_test: { type: 'string' }
      },
      required: ['city', 'condition']
    },
    msg: { type: 'string' },
    acccccc: { type: 'number' },
    bddddd: { type: 'integer' }
  }
}
