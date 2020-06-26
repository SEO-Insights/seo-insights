/**
 * Class to structure the Dublin Core tag information.
 */
class DublinCoreTagInfo {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

/**
 * The Dublin Core meta tags with additional information.
 * 
 * source:
 *  - https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#section-2
 */
let DublinCoreTermsTags = [
    new DublinCoreTagInfo('DC.abstract', 'A summary of the resource.'),
    new DublinCoreTagInfo('DC.accessRights', 'Information about who access the resource or an indication of its security status.'),
    new DublinCoreTagInfo('DC.accrualMethod', 'The method by which items are added to a collection.'),
    new DublinCoreTagInfo('DC.accrualPeriodicity', 'The frequency with which items are added to a collection.'),
    new DublinCoreTagInfo('DC.accrualPolicy', 'The policy governing the addition of items to a collection.'),
    new DublinCoreTagInfo('DC.alternative', 'An alternative name for the resource.'),
    new DublinCoreTagInfo('DC.audience', 'A class of agents for whom the resource is intended or useful.'),
    new DublinCoreTagInfo('DC.available', 'Date that the resource became or will become available.'),
    new DublinCoreTagInfo('DC.bibliographicCitationMore', 'A bibliographic reference for the resource.'),
    new DublinCoreTagInfo('DC.conformsTo', 'An established standard to which the described resource conforms.'),
    new DublinCoreTagInfo('DC.contributor', 'An entity responsible for making contributions to the resource.'),
    new DublinCoreTagInfo('DC.coverage', 'The spatial or temporal topic of the resource, spatial applicability of the resource, or jurisdiction under which the resource is relevant.'),
    new DublinCoreTagInfo('DC.created', 'Date of creation of the resource.'),
    new DublinCoreTagInfo('DC.creator', 'An entity responsible for making the resource.'),
    new DublinCoreTagInfo('DC.date', 'A point or period of time associated with an event in the lifecycle of the resource.'),
    new DublinCoreTagInfo('DC.dateAccepted', 'Date of acceptance of the resource.'),
    new DublinCoreTagInfo('DC.dateCopyrighted', 'Date of copyright of the resource.'),
    new DublinCoreTagInfo('DC.dateSubmitted', 'Date of submission of the resource.'),
    new DublinCoreTagInfo('DC.description', 'An account of the resource.'),
    new DublinCoreTagInfo('DC.educationLevel', 'A class of agents, defined in terms of progression through an educational or training context, for which the described resource is intended.'),
    new DublinCoreTagInfo('DC.extent', 'The size or duration of the resource.'),
    new DublinCoreTagInfo('DC.format', 'The file format, physical medium, or dimensions of the resource.'),
    new DublinCoreTagInfo('DC.hasFormat', 'A related resource that is substantially the same as the pre-existing described resource, but in another format.'),
    new DublinCoreTagInfo('DC.hasPart', 'A related resource that is included either physically or logically in the described resource.'),
    new DublinCoreTagInfo('DC.hasVersion', 'A related resource that is a version, edition, or adaptation of the described resource.'),
    new DublinCoreTagInfo('DC.identifier', 'An unambiguous reference to the resource within a given context.'),
    new DublinCoreTagInfo('DC.instructionalMethod', 'A process, used to engender knowledge, attitudes and skills, that the described resource is designed to support.'),
    new DublinCoreTagInfo('DC.isFormatOf', 'A pre-existing related resource that is substantially the same as the described resource, but in another format.'),
    new DublinCoreTagInfo('DC.isPartOf', 'A related resource in which the described resource is physically or logically included.'),
    new DublinCoreTagInfo('DC.isReferencedBy', 'A related resource that references, cites, or otherwise points to the described resource.'),
    new DublinCoreTagInfo('DC.isReplacedBy', 'A related resource that supplants, displaces, or supersedes the described resource.'),
    new DublinCoreTagInfo('DC.isRequiredBy', 'A related resource that requires the described resource to support its function, delivery, or coherence.'),
    new DublinCoreTagInfo('DC.issued', 'Date of formal issuance of the resource.'),
    new DublinCoreTagInfo('DC.isVersionOf', 'A related resource of which the described resource is a version, edition, or adaptation.'),
    new DublinCoreTagInfo('DC.language', 'A language of the resource.'),
    new DublinCoreTagInfo('DC.license', 'A legal document giving official permission to do something with the resource.'),
    new DublinCoreTagInfo('DC.mediator', 'An entity that mediates access to the resource.'),
    new DublinCoreTagInfo('DC.medium', 'The material or physical carrier of the resource.'),
    new DublinCoreTagInfo('DC.modified', 'Date on which the resource was changed.'),
    new DublinCoreTagInfo('DC.provenance', 'A statement of any changes in ownership and custody of the resource since its creation that are significant for its authenticity, integrity, and interpretation.'),
    new DublinCoreTagInfo('DC.publisher', 'An entity responsible for making the resource available.'),
    new DublinCoreTagInfo('DC.references', 'A related resource that is referenced, cited, or otherwise pointed to by the described resource.'),
    new DublinCoreTagInfo('DC.relation', 'A related resource.'),
    new DublinCoreTagInfo('DC.replaces', 'A related resource that is supplanted, displaced, or superseded by the described resource.'),
    new DublinCoreTagInfo('DC.requires', 'A related resource that is required by the described resource to support its function, delivery, or coherence.'),
    new DublinCoreTagInfo('DC.rights', 'Information about rights held in and over the resource.'),
    new DublinCoreTagInfo('DC.rightsHolder', 'A person or organization owning or managing rights over the resource.'),
    new DublinCoreTagInfo('DC.source', 'A related resource from which the described resource is derived.'),
    new DublinCoreTagInfo('DC.spatial', 'Spatial characteristics of the resource.'),
    new DublinCoreTagInfo('DC.subject', 'A topic of the resource.'),
    new DublinCoreTagInfo('DC.tableOfContents', 'A list of subunits of the resource.'),
    new DublinCoreTagInfo('DC.temporal', 'Temporal characteristics of the resource.'),
    new DublinCoreTagInfo('DC.title', 'A name given to the resource.'),
    new DublinCoreTagInfo('DC.type', 'The nature or genre of the resource.'),
    new DublinCoreTagInfo('DC.valid', 'Date (often a range) of validity of a resource.')
];