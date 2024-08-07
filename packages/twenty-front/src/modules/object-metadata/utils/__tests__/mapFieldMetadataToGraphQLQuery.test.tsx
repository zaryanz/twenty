import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const formatGQLString = (inputString: string) =>
  inputString.replace(/^\s*[\r\n]/gm, '');

const personObjectMetadataItem = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('ObjectMetadataItem not found');
}

describe('mapFieldMetadataToGraphQLQuery', () => {
  it('should return fieldName if simpleValue', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'id',
      )!,
    });
    expect(formatGQLString(res)).toEqual('id');
  });
  it('should return fieldName if composite', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`name
{
  firstName
  lastName
}`);
  });

  it('should return non relation subFields if relation', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
domainName
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}
updatedAt
name
accountOwnerId
employees
id
idealCustomerProfile
}`);
  });

  it('should return only return relation subFields that are in recordGqlFields', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      relationrecordFields: {
        accountOwner: { id: true, name: true },
        people: true,
        xLink: true,
        linkedinLink: true,
        domainName: true,
        annualRecurringRevenue: true,
        createdAt: true,
        address: { addressStreet1: true },
        updatedAt: true,
        name: true,
        accountOwnerId: true,
        employees: true,
        id: true,
        idealCustomerProfile: true,
      },
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
accountOwner
{
__typename
name
{
  firstName
  lastName
}
id
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
domainName
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}
updatedAt
people
{
  edges {
    node {
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
id
createdAt
city
email
jobTitle
name
{
  firstName
  lastName
}
phone
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
updatedAt
avatarUrl
companyId
}
  }
}
name
accountOwnerId
employees
id
idealCustomerProfile
}`);
  });
});
