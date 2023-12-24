import Location from "../models/Location";

interface LocationData {
  lat: number;
  lng: number;
}

class LocationService {
  getAroundLocation = async (location: LocationData) => {
    // SUGGEST: 두 지점 사이의 거리를 구하는 것은 좋은데...Location의 모든 데이터와 대조하는 건 너무 비효율적임.
    // SUGGEST: Location을 생성할 때, 어떤 공항 주변의 데이터인지 같이 알 수 있으면 데이터를 미리 추려내기 편할 것이라고 생각된다.
    // SUGGEST: 즉, Feed를 생성할 때, 이를 처리해줘야한다는 것.
    // SUGGEST: 아마 프론트 쪽에서 select 태그로 만들어줘야할 것이고, 그 태그들은 공항을 표시하고 있어야할 것이고, 그 공항들은 lat, lng, address 데이터를 가지고 있어야할 것이다.
    // reference : how to calculate distance between two points
    // https://www.mongodb.com/docs/current/core/indexes/index-types/geospatial/2dsphere/query/proximity-to-geojson/#query-for-locations-near-a-point-on-a-sphere
    // https://medium.com/@dltkdals2202/mongodb%EC%97%90%EC%84%9C-geojson%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%B0%98%EA%B2%BD%EA%B3%84%EC%82%B0-179d4f0dcf9
    // https://ko.martech.zone/calculate-great-circle-distance/
    const calculatedLocation = await Location.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          $maxDistance: 100000, // meter. 100km
        },
      },
    })
      .populate({
        path: "feed",
        select: "-location -writer -comments -subComments",
        populate: {
          path: "images",
          select: "path",
          options: { limit: 1 },
        },
      })
      .limit(10);

    return calculatedLocation;
  };
}

export default LocationService;
