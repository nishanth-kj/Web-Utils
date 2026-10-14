import { describe, expect, it } from "vitest";
import { csvToJson, jsonToCsv, jsonToYaml, yamlToJson } from "@/lib/convert";

describe("jsonToYaml / yamlToJson", () => {
    it("converts JSON to YAML", () => {
        expect(jsonToYaml('{"name":"web","tags":["a","b"],"nested":{"on":true}}')).toBe(
            "name: web\ntags:\n  - a\n  - b\nnested:\n  'on': true\n"
        );
    });

    it("round-trips data through YAML", () => {
        const data = { id: 1, items: [{ x: null }, { y: "two: words" }] };
        expect(JSON.parse(yamlToJson(jsonToYaml(JSON.stringify(data))))).toEqual(data);
    });

    it("keeps multiple documents separate", () => {
        expect(jsonToYaml('{"a":1}\n{"b":2}')).toBe("a: 1\n---\nb: 2\n");
        expect(yamlToJson("a: 1\n---\nb: 2\n")).toBe('{\n  "a": 1\n}\n\n{\n  "b": 2\n}');
    });

    it("reports YAML syntax errors", () => {
        expect(() => yamlToJson("a: [1, 2")).toThrow();
    });
});

describe("csvToJson", () => {
    it("turns rows into objects keyed by header", () => {
        expect(JSON.parse(csvToJson('name,city\n"Doe, Jane",Paris'))).toEqual([{ name: "Doe, Jane", city: "Paris" }]);
    });
});

describe("jsonToCsv", () => {
    it("uses the union of keys as columns", () => {
        expect(jsonToCsv('[{"a":1,"b":"x, y"},{"c":true}]')).toBe('a,b,c\n1,"x, y",\n,,true');
    });

    it("serializes nested values as JSON", () => {
        expect(jsonToCsv('{"id":1,"meta":{"k":"v"},"none":null}')).toBe('id,meta,none\n1,"{""k"":""v""}",');
    });

    it("rejects data that isn't tabular", () => {
        expect(() => jsonToCsv("[1,2,3]")).toThrow(/array of objects/);
        expect(() => jsonToCsv("[]")).toThrow(/array of objects/);
    });
});
